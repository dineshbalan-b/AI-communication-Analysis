import os
import random
import tempfile
import asyncio
import logging
import traceback
from typing import List
from pathlib import Path

from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv
from openai import OpenAI
import time
import io

from auth import create_user, verify_user, init_user_db
from database import init_evaluation_db, save_evaluation, get_user_progress, delete_evaluation, bulk_delete_evaluations
from audio_preprocessing import preprocess_audio
from communication_analysis import (
    analyze_audio,
    analyze_text,
    compute_communication_score
)
from llm_engine import (
    evaluate_with_llm,
    compute_hybrid_score,
    generate_tts_audio, # Changed from generate_spoken_feedback
    generate_topics,
    is_english,
    speech_to_text
)

# -------------------------------
# Setup & Config
# -------------------------------
# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("backend.log")
    ]
)
logger = logging.getLogger("speakclear")

env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

API_KEY = os.getenv("API_KEY")
BASE_URL = os.getenv("BASE_URL")

if not API_KEY:
    raise RuntimeError("API_KEY not found in .env file.")

client = OpenAI(
    api_key=API_KEY,
    base_url=BASE_URL
)

# Initialize databases
init_user_db()
init_evaluation_db()

UPLOADS_DIR = Path(__file__).parent / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="SpeakClear AI API")

app.mount("/api/audio", StaticFiles(directory=UPLOADS_DIR), name="audio")

# Configure CORS to allow the React/Next.js frontend to communicate securely
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8010",
        "http://127.0.0.1:8010"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------
# API Routes
# -------------------------------

@app.post("/api/register")
async def register(username: str = Form(...), password: str = Form(...)):
    if create_user(username, password):
        return {"status": "success", "message": "Account created"}
    raise HTTPException(status_code=400, detail="Username already exists")

@app.post("/api/login")
async def login(username: str = Form(...), password: str = Form(...)):
    if verify_user(username, password):
        # In a real app, you'd set a session cookie or return a JWT token here.
        return {"status": "success", "username": username}
    raise HTTPException(status_code=401, detail="Invalid credentials")

@app.post("/api/upload")
async def upload_audio(file: UploadFile = File(...), username: str = Form(...), topic: str = Form(...)):
    if not topic:
        raise HTTPException(status_code=400, detail="Topic is required")
        
    temp_input_path = None
    try:
        # Extract extension from filename, or default to .webm for browser blobs
        ext = os.path.splitext(file.filename)[1] if (file.filename and '.' in file.filename) else ".webm"
        # If it's a blob from the browser with a fake 'audio.wav' name but webm content, force webm
        if ext.lower() == ".wav" and file.content_type == "audio/webm":
            ext = ".webm"
        
        # Save uploaded file
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
            content = await file.read()
            tmp.write(content)
            temp_input_path = tmp.name

        # Unique filename for permanent storage
        timestamp = int(time.time())
        safe_username = "".join(c for c in username if c.isalnum() or c in ('-', '_'))
        permanent_filename = f"{safe_username}_{timestamp}{ext}"
        permanent_filepath = UPLOADS_DIR / permanent_filename
        
        # Save a copy to permanent storage
        with open(permanent_filepath, "wb") as f:
            f.write(content)
            
        audio_url = f"/api/audio/{permanent_filename}"

        # Process Audio
        processed_path = preprocess_audio(temp_input_path)

        # Run Transcription and Audio Metrics concurrently to save time
        def get_transcription_sync():
            return speech_to_text(processed_path)

        # Execute both tasks in parallel
        transcription_task = asyncio.to_thread(get_transcription_sync)
        metrics_task = asyncio.to_thread(analyze_audio, processed_path)
        
        transcript_text, audio_metrics = await asyncio.gather(transcription_task, metrics_task)
        
        transcript = transcript_text.strip() if transcript_text else ""
        save_to_db = True
        no_speech = False
        language_rejected = False
        error_message = ""
        
        # Check for empty transcription or minimal content
        if not transcript or len(transcript) < 5:
            save_to_db = False
            no_speech = True
            # Zero out all metrics...
            audio_metrics = {
                "duration": audio_metrics.get("duration", 0),
                "speech_ratio": 0,
                "total_pause_time": 0,
                "avg_pause": 0,
                "max_pause": 0,
                "pause_count": 0,
                "pitch_variance": 0,
                "energy_variance": 0
            }
            text_metrics = {"wpm": 0, "filler_count": 0}
            llm_scores = {
                "grammar": 0, "vocabulary": 0, "clarity": 0, "confidence": 0,
                "final_feedback": "No significant speech detected.",
                "improvements": "Try recording again speaking clearly."
            }
            hybrid_score = 0
        
        # Language detection (New requirement)
        elif not is_english(transcript):
            save_to_db = False
            language_rejected = True
            error_message = "Only English communication is supported. Please speak in English."
            
            # Populate defaults for the UI to handle gracefully
            audio_metrics = {
                "duration": audio_metrics.get("duration", 0),
                "speech_ratio": audio_metrics.get("speech_ratio", 0),
                "total_pause_time": 0, "avg_pause": 0, "max_pause": 0, "pause_count": 0, "pitch_variance": 0, "energy_variance": 0
            }
            text_metrics = {"wpm": 0, "filler_count": 0}
            llm_scores = {
                "grammar": 0, "vocabulary": 0, "clarity": 0, "confidence": 0,
                "final_feedback": error_message,
                "improvements": "Please record your response in English to receive a detailed analysis."
            }
            hybrid_score = 0
        else:
            # Normal Processing Pipeline
            text_metrics = analyze_text(transcript, audio_metrics["duration"])
            rule_score = compute_communication_score(audio_metrics, text_metrics)
            llm_scores = evaluate_with_llm(topic, transcript, audio_metrics, text_metrics)
            hybrid_score = compute_hybrid_score(rule_score, llm_scores)

            # Generate and save TTS Audio Feedback automatically
            feedback_text = f"Here is your summary evaluation.\n\n{llm_scores.get('final_feedback', '')}\n\nHere are some areas to focus on.\n\n{llm_scores.get('improvements', '')}"
            audio_bytes = generate_tts_audio(feedback_text)
            
            feedback_audio_url = ""
            if audio_bytes:
                tts_filename = f"tts_{permanent_filename}"
                tts_filepath = UPLOADS_DIR / tts_filename
                with open(tts_filepath, "wb") as f:
                    f.write(audio_bytes)
                feedback_audio_url = f"/api/audio/{tts_filename}"

        # Save to DB only if speech was detected
        if save_to_db:
            save_evaluation(
                username, topic, transcript, hybrid_score,
                llm_scores.get("grammar", 0),
                llm_scores.get("vocabulary", 0),
                llm_scores.get("clarity", 0),
                llm_scores.get("confidence", 0),
                relevance=llm_scores.get("relevance", 0),
                wpm=text_metrics["wpm"],
                filler_count=text_metrics["filler_count"],
                speech_ratio=audio_metrics["speech_ratio"],
                final_feedback=llm_scores.get("final_feedback", ""),
                improvements=llm_scores.get("improvements", ""),
                audio_url=audio_url,
                feedback_audio_url=feedback_audio_url
            )

        # Clean processed file
        if os.path.exists(processed_path):
            os.remove(processed_path)

        return {
            "status": "success",
            "no_speech": no_speech,
            "language_rejected": language_rejected,
            "error_message": error_message,
            "transcript": transcript,
            "metrics": {
                "wpm": round(text_metrics["wpm"], 2),
                "filler_count": text_metrics["filler_count"],
                "speech_ratio": round(audio_metrics["speech_ratio"], 2)
            },
            "evaluation": llm_scores,
            "final_score": hybrid_score,
            "feedback_audio_url": feedback_audio_url if save_to_db else ""
        }

    except Exception as e:
        logger.error(f"Error during audio upload/processing: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Clean temp input
        if temp_input_path and os.path.exists(temp_input_path):
            os.remove(temp_input_path)

@app.get("/api/progress")
async def get_progress(username: str):
    data = get_user_progress(username)
    if not data:
        return {"status": "success", "data": []}
    return {"status": "success", "data": [
        {
            "id": row[0], 
            "date": row[1], 
            "topic": row[2], 
            "score": row[3],
            "grammar": row[4],
            "vocabulary": row[5],
            "clarity": row[6],
            "confidence": row[7],
            "transcript": row[8],
            "wpm": row[9],
            "filler_count": row[10],
            "speech_ratio": row[11],
            "final_feedback": row[12],
            "improvements": row[13],
            "audio_url": row[14] if len(row) > 14 else "",
            "relevance": row[15] if len(row) > 15 else 0,
            "feedback_audio_url": row[16] if len(row) > 16 else ""
        } for row in data
    ]}

@app.delete("/api/session/{session_id}")
async def delete_session(session_id: int):
    if delete_evaluation(session_id):
        return {"status": "success", "message": "Session deleted"}
    raise HTTPException(status_code=400, detail="Failed to delete session")

class BulkDeleteRequest(BaseModel):
    ids: List[int]

@app.post("/api/sessions/bulk-delete")
async def bulk_delete(request: BulkDeleteRequest):
    if not request.ids:
        raise HTTPException(status_code=400, detail="No session IDs provided")
    
    if bulk_delete_evaluations(request.ids):
        return {"status": "success", "message": f"{len(request.ids)} sessions deleted"}
    raise HTTPException(status_code=500, detail="Failed to delete sessions")

class AudioFeedbackRequest(BaseModel):
    text: str

@app.post("/api/generate-audio-feedback")
async def generate_audio_feedback(request: AudioFeedbackRequest):
    if not request.text:
        raise HTTPException(status_code=400, detail="No text provided")
        
    try:
        audio_bytes = generate_tts_audio(request.text)
        if not audio_bytes:
            raise HTTPException(status_code=500, detail="TTS generation failed")
            
        return StreamingResponse(
            io.BytesIO(audio_bytes),
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": "attachment; filename=feedback.mp3"
            }
        )
    except Exception as e:
        logger.error(f"Generate audio feedback error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/topics")
async def get_topics(force: bool = False):
    topics = generate_topics(force_refresh=force)
    return {"status": "success", "topics": [{"name": t, "icon": "auto_awesome"} for t in topics]}