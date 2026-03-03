import streamlit as st
import random
import tempfile
import os
from pathlib import Path
from dotenv import load_dotenv
from openai import OpenAI

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
# Load API Key
# -------------------------------

env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

API_KEY = os.getenv("API_KEY")
BASE_URL = os.getenv("BASE_URL")

if not API_KEY:
    st.error("API_KEY not found in .env file.")
    st.stop()

client = OpenAI(
    api_key=API_KEY,
    base_url=BASE_URL
)

# -------------------------------
# UI Setup
# -------------------------------

st.set_page_config(page_title="AI Communication Evaluator", layout="centered")
st.title("🎙 AI Communication Skill Evaluator")

topics = [
    "Describe your biggest achievement.",
    "Talk about a failure and what you learned.",
    "Why should we hire you?",
    "Explain a technical project you worked on.",
    "Discuss the impact of AI in daily life.",
    "Is remote work better than office work?",
    "Talk about leadership qualities.",
    "Describe your dream company.",
    "Explain a challenging situation you handled.",
    "What motivates you?"
]

if "current_topic" not in st.session_state:
    st.session_state.current_topic = None

if st.button("Generate Random Topic"):
    st.session_state.current_topic = random.choice(topics)

if st.session_state.current_topic:
    st.subheader("Your Topic:")
    st.info(st.session_state.current_topic)

st.subheader("Upload or Record Your Response")

audio_file = st.file_uploader("Upload Audio", type=["mp3", "wav", "m4a"])
recorded_audio = st.audio_input("Or Record Audio")

# -------------------------------
# Submit Logic
# -------------------------------

if st.button("Submit Response"):

    if not st.session_state.current_topic:
        st.warning("Please generate a topic first.")
        st.stop()

    temp_input_path = None

    if audio_file:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            tmp.write(audio_file.read())
            temp_input_path = tmp.name

    elif recorded_audio:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            tmp.write(recorded_audio.read())
            temp_input_path = tmp.name
    else:
        st.warning("Upload or record audio first.")
        st.stop()

    # -------------------------------
    # Preprocessing
    # -------------------------------

    st.info("Preprocessing audio...")
    processed_path = preprocess_audio(temp_input_path)

    # -------------------------------
    # STT
    # -------------------------------

    st.info("Transcribing speech...")

    with open(processed_path, "rb") as audio_data:
        transcription = client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_data
        )

    transcript = transcription.text.strip()

    st.subheader("Extracted Transcript")
    st.write(transcript)

    # -------------------------------
    # Objective Metrics
    # -------------------------------

    audio_metrics = analyze_audio(processed_path)
    text_metrics = analyze_text(transcript, audio_metrics["duration"])

    rule_score = compute_communication_score(audio_metrics, text_metrics)

    # -------------------------------
    # LLM Evaluation
    # -------------------------------

    st.info("Evaluating grammar and vocabulary...")

    llm_scores = evaluate_with_llm(
        st.session_state.current_topic,
        transcript,
        audio_metrics,
        text_metrics
    )

    hybrid_score = compute_hybrid_score(rule_score, llm_scores)

    # -------------------------------
    # Display Results
    # -------------------------------

    st.subheader("📊 Objective Metrics")
    st.metric("Words Per Minute", round(text_metrics["wpm"], 2))
    st.metric("Filler Words", text_metrics["filler_count"])
    st.metric("Speech Ratio", round(audio_metrics["speech_ratio"], 2))

    st.subheader("🧠 Language Evaluation")
    st.write("Grammar:", llm_scores["grammar"])
    st.write("Vocabulary:", llm_scores["vocabulary"])
    st.write("Structure:", llm_scores["structure"])
    st.write("Clarity:", llm_scores["clarity"])
    st.write("Confidence:", llm_scores["confidence"])
    st.write("Relevance:", llm_scores["relevance"])

    st.subheader("🏆 Final Hybrid Score")
    st.progress(hybrid_score / 100)
    st.success(f"{hybrid_score}/100")

    st.subheader("📝 Final Written Feedback")
    st.write(llm_scores["final_feedback"])
    st.write("Improvements:", llm_scores["improvements"])

    # -------------------------------
    # Audio Feedback
    # -------------------------------

    st.info("Generating spoken feedback...")

    feedback_audio_path = generate_spoken_feedback(llm_scores, hybrid_score)

    st.subheader("🔊 Audio Feedback")
    st.audio(feedback_audio_path)

    if os.path.exists(temp_input_path):
        os.remove(temp_input_path)