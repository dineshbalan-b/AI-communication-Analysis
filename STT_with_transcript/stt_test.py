import os
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables (assuming you have a .env file with API_KEY)
# If testing from this folder directly, you might need to copy the .env file here 
# or point to the backend's .env file: load_dotenv("../backend/.env")
load_dotenv()
API_KEY = os.getenv("API_KEY")
BASE_URL = os.getenv("BASE_URL")


def speech_to_text(audio_path):
    """
    Convert speech to text using the Whisper model.
    This is the core STT code extracted from llm_engine.py.
    """
    print(f"Transcribing audio from: {audio_path}...")
    try:
        with open(audio_path, "rb") as audio_file:
            transcription = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file
            )
        print("Transcription successful!")
        return transcription.text
    except Exception as e:
        print(f"Error during transcription: {e}")
        return None

if __name__ == "__main__":
    # ==========================================
    # Example usage for testing the STT code
    # ==========================================
    
    # Replace 'sample_audio.wav' with the path to your actual audio file
    test_audio_path = "yuva_1772818065.wav"
    
    if os.path.exists(test_audio_path):
        transcript = speech_to_text(test_audio_path)
        print("\n--- Detected Transcript ---")
        print(transcript)
        print("---------------------------")
    else:
        print(f"No audio file found at '{test_audio_path}'.")
        print("Please place a sample audio file named 'sample_audio.wav' in this folder and run again to test.")
