import time
import librosa
from jiwer import wer, cer
from openai import OpenAI
from audio_preprocessing import preprocess_audio
from dotenv import load_dotenv
import os



# --------------------------------
# CONFIGURATION
# --------------------------------

load_dotenv()
API_KEY = os.getenv("API_KEY")

BASE_URL = "https://apidev.navigatelabsai.com/v1"

AUDIO_PATH = "your_audio.wav"

GROUND_TRUTH = """
Type your exact spoken sentence here
""".strip().lower()


# --------------------------------
# Initialize Nexus Client
# --------------------------------

client = OpenAI(
    api_key=API_KEY,
    base_url=BASE_URL
)


# --------------------------------
# Step 1: Preprocess Audio
# --------------------------------

print("Preprocessing audio...")
processed_path = preprocess_audio(AUDIO_PATH)


# --------------------------------
# Step 2: Transcription via Nexus Whisper
# --------------------------------

print("Transcribing via Nexus API...")

start_time = time.time()

with open(processed_path, "rb") as audio_file:
    transcription = client.audio.transcriptions.create(
        model="whisper-1",
        file=audio_file
    )

end_time = time.time()

predicted_text = transcription.text.strip().lower()


# --------------------------------
# Step 3: Compute RTF
# --------------------------------

audio_duration = librosa.get_duration(path=processed_path)
processing_time = end_time - start_time

rtf = processing_time / audio_duration


# --------------------------------
# Step 4: Compute WER & CER
# --------------------------------

word_error_rate = wer(GROUND_TRUTH, predicted_text)
char_error_rate = cer(GROUND_TRUTH, predicted_text)


# --------------------------------
# Results
# --------------------------------

print("\n=========== STT API EVALUATION ===========\n")

print("Ground Truth:")
print(GROUND_TRUTH)

print("\nPredicted Text:")
print(predicted_text)

print("\n-------------------------------------------")

print(f"Audio Duration  : {audio_duration:.2f} sec")
print(f"Processing Time : {processing_time:.2f} sec")
print(f"RTF             : {rtf:.2f}")

print("\nAccuracy Metrics:")
print(f"WER : {word_error_rate * 100:.2f}%")
print(f"CER : {char_error_rate * 100:.2f}%")

print("\n===========================================")