import librosa
import soundfile as sf
import sys
import numpy as np

def test_trim(audio_path, top_db_val):
    print(f"Testing with top_db={top_db_val}...")
    y, sr = librosa.load(audio_path, sr=16000, mono=True)
    
    # original duration
    orig_dur = librosa.get_duration(y=y, sr=sr)
    print(f"Original duration: {orig_dur:.2f} seconds")
    
    # Trim
    y_trimmed, _ = librosa.effects.trim(y, top_db=top_db_val)
    
    # trimmed duration
    trim_dur = librosa.get_duration(y=y_trimmed, sr=sr)
    print(f"Trimmed duration: {trim_dur:.2f} seconds")
    print(f"Kept: {(trim_dur/orig_dur)*100:.1f}% of audio\n")

if __name__ == "__main__":
    test_file = "d:/NAVIGATE_LABS/3_Voice_Ai/3_Capstone/AI-communication-Analysis-main/STT_with_transcript/yuva_1772818065.wav"
    
    try:
        test_trim(test_file, 12)  # Current aggressive setting
        test_trim(test_file, 30)  # More standard setting
        test_trim(test_file, 40)  # Very safe setting
    except Exception as e:
        print(f"Error: {e}")
