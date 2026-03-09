import os
import json
import time
import logging
import re
from dotenv import load_dotenv
from openai import OpenAI

logger = logging.getLogger("speakclear.llm")


# API Configuration

load_dotenv()
API_KEY = os.getenv("API_KEY")
BASE_URL = os.getenv("BASE_URL")

if not API_KEY:
    raise ValueError("API_KEY not found in .env file")

client = OpenAI(api_key=API_KEY, base_url=BASE_URL)



# Helpers

def _extract_json(text):
    """Robustly extract JSON from a string, handling markdown triple backticks."""
    try:
        # Try to find JSON block
        match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', text, re.DOTALL)
        if match:
            return json.loads(match.group(1))
        # Fallback to finding first { and last }
        start = text.find('{')
        end = text.rfind('}')
        if start != -1 and end != -1:
            return json.loads(text[start:end+1])
        return json.loads(text)
    except Exception as e:
        logger.error(f"JSON extraction failed: {e} | Content: {text[:100]}...")
        return None



# Speech-to-Text (Whisper)


def speech_to_text(audio_path):
    """Convert speech audio to text using OpenAI Whisper and detect language."""
    logger.info(f"Transcribing {audio_path}...")
    try:
        with open(audio_path, "rb") as audio_file:
            response = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                response_format="verbose_json"
            )
        
        # Extract text and detected language code (e.g., 'en', 'ta')
        transcript = getattr(response, 'text', '')
        language = getattr(response, 'language', 'en')
        
        return transcript, language
    except Exception as e:
        logger.error(f"Transcription error: {e}")
        return None, "en"



# Language Detection


def is_english(transcript):
    """Detect if the transcript is primarily in English with strict phonetic check."""
    if not transcript or len(transcript.strip()) < 5:
        return True

    prompt = f"""
    Analyze if this text is meaningful, grammatically structured English:
    "{transcript}"
    
    Tasks:
    1. Is this legitimate, meaningful English communication?
    2. Is this 'phonetic gibberish' (English words that represent the sound of another language like Tamil)?
    3. Is it a transcription hallucination of background noise?

    If it is legitimate English communication, return 'ENGLISH'.
    If it is sounds, gibberish, or another language, return 'NON_ENGLISH'.
    
    Return ONLY 'ENGLISH' or 'NON_ENGLISH'.
    """
    try:
        response = client.chat.completions.create(
            model="gpt-4.1-nano",
            messages=[{"role": "user", "content": prompt}],
            temperature=0,
            max_tokens=5
        )
        return "ENGLISH" in response.choices[0].message.content.upper()
    except Exception:
        return True



# LLM-Based Evaluation


def evaluate_with_llm(topic, transcript, audio_metrics, text_metrics, historical_context=None):
    """
    Use GPT to evaluate communication skills with historical context.
    """
    prompt = f"""
You are an expert communication coach.

Topic: {topic}
Transcript: {transcript}

Objective Metrics:
- WPM: {text_metrics['wpm']:.1f}
- Fillers: {text_metrics['filler_count']}
- Vocab Richness: {text_metrics['vocab_richness']:.2f}
- Avg Pause: {audio_metrics['avg_pause']:.2f}s
- Speech Ratio: {audio_metrics['speech_ratio']:.2f}

Progress Context: {historical_context or "No previous history."}

Evaluate (0-10): Grammar, Vocabulary, Structure, Clarity, Confidence, Relevance, Overall.
Compare with history if available.

Return strictly JSON:
{{
  "grammar": 0-10, "vocabulary": 0-10, "structure": 0-10,
  "clarity": 0-10, "confidence": 0-10, "relevance": 0-10, "overall": 0-10,
  "final_feedback": "...", "improvements": "..."
}}
"""
    try:
        response = client.chat.completions.create(
            model="gpt-4.1-nano",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3
        )
        result = _extract_json(response.choices[0].message.content)
        return result or {
            "grammar": 0, "vocabulary": 0, "structure": 0, "clarity": 0, 
            "confidence": 0, "relevance": 0, "overall": 0,
            "final_feedback": "Error parsing evaluation. Please try again.",
            "improvements": "N/A"
        }
    except Exception as e:
        logger.error(f"LLM Eval error: {e}")
        return None



# Hybrid Score Calculation


def compute_hybrid_score(rule_score, llm_scores):
    """Combine rule-based and LLM scores (40/60 split)."""
    if not llm_scores: return rule_score
    return round((0.4 * rule_score) + (0.6 * llm_scores.get("overall", 0) * 10))



# Text-to-Speech Feedback


def generate_tts_audio(text):
    """Generate spoken audio feedback using OpenAI TTS."""
    try:
        response = client.audio.speech.create(
            model="gpt-4o-mini-tts",
            voice="nova",
            input=text[:4000] # Safe limit
        )
        return response.read()
    except Exception as e:
        logger.error(f"TTS error: {e}")
        return None



# Dynamic Topic Generation


_TOPIC_CACHE, _LAST_FETCH_TIME = [], 0
_DEFAULT_TOPICS = ["Daily Routine", "Travel Story", "Work Goals", "Tech Trends", "Hobbies", "Book Review"]

def generate_topics(force_refresh=False):
    """Generate practice topics with 1-hour cache."""
    global _TOPIC_CACHE, _LAST_FETCH_TIME
    if not force_refresh and _TOPIC_CACHE and (time.time() - _LAST_FETCH_TIME < 3600):
        return _TOPIC_CACHE

    try:
        prompt = "Generate 6 unique communication practice topics. Return JSON: {\"topics\": [\"topic1\", ...]}"
        response = client.chat.completions.create(
            model="gpt-4.1-nano",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        data = _extract_json(response.choices[0].message.content)
        if data and "topics" in data:
            _TOPIC_CACHE = data["topics"][:6]
            _LAST_FETCH_TIME = time.time()
            return _TOPIC_CACHE
    except Exception:
        pass
    return _DEFAULT_TOPICS