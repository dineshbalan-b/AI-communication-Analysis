import os
import random
import tempfile
from pathlib import Path

from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from dotenv import load_dotenv
from openai import OpenAI

from auth import create_user, verify_user, init_user_db
from database import init_evaluation_db, save_evaluation, get_user_progress
from audio_preprocessing import preprocess_audio
from communication_analysis import (
    analyze_audio,
    analyze_text,
    compute_communication_score
)
from llm_engine import (
    evaluate_with_llm,
    compute_hybrid_score,
    generate_spoken_feedback
)

# -------------------------------
# Setup & Config
# -------------------------------
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

app = FastAPI(title="SpeakClear AI API")

# Setup templates and static files (if static folder exists)
templates = Jinja2Templates(directory="templates")
# app.mount("/static", StaticFiles(directory="static"), name="static")

# -------------------------------
# UI Routes (Serving HTML)
# -------------------------------

@app.get("/", response_class=HTMLResponse)
async def home_page(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@app.get("/dashboard", response_class=HTMLResponse)
async def dashboard_page(request: Request):
    return templates.TemplateResponse("code.html", {"request": request})

@app.get("/assessment", response_class=HTMLResponse)
async def assessment_page(request: Request):
    return templates.TemplateResponse("assessment.html", {"request": request})

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
        # Save uploaded file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            content = await file.read()
            tmp.write(content)
            temp_input_path = tmp.name

        # Process Audio
        processed_path = preprocess_audio(temp_input_path)

        # Transcribe
        with open(processed_path, "rb") as audio_data:
            transcription = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_data
            )
        transcript = transcription.text.strip()

        # Metrics
        audio_metrics = analyze_audio(processed_path)
        text_metrics = analyze_text(transcript, audio_metrics["duration"])
        rule_score = compute_communication_score(audio_metrics, text_metrics)

        # LLM Eval
        llm_scores = evaluate_with_llm(topic, transcript, audio_metrics, text_metrics)
        hybrid_score = compute_hybrid_score(rule_score, llm_scores)

        # Save to DB
        save_evaluation(
            username, topic, transcript, hybrid_score,
            llm_scores.get("grammar", 0),
            llm_scores.get("vocabulary", 0),
            llm_scores.get("clarity", 0),
            llm_scores.get("confidence", 0)
        )

        # Clean processed file
        if os.path.exists(processed_path):
            os.remove(processed_path)

        return {
            "status": "success",
            "transcript": transcript,
            "metrics": {
                "wpm": round(text_metrics["wpm"], 2),
                "filler_count": text_metrics["filler_count"],
                "speech_ratio": round(audio_metrics["speech_ratio"], 2)
            },
            "evaluation": llm_scores,
            "final_score": hybrid_score
        }

    except Exception as e:
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
    return {"status": "success", "data": [{"date": row[0], "score": row[1]} for row in data]}