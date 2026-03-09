import os
import subprocess
import tempfile
import io

import numpy as np
import librosa
import noisereduce as nr
import soundfile as sf
from pydub import AudioSegment
from pydub.effects import compress_dynamic_range

from config import FFMPEG_PATH

# --------------------------------
# Main Preprocessing Pipeline
# --------------------------------

def preprocess_audio(input_path):
    """
    Optimized audio preprocessing pipeline:
    1. Convert to 16kHz mono WAV (via ffmpeg)
    2. Normalize volume
    3. Reduce background noise
    4. Trim silence from start/end
    5. Apply dynamic range compression (in-memory)
    """
    if not FFMPEG_PATH:
        raise RuntimeError(
            "ffmpeg not found! Install it with: winget install Gyan.FFmpeg "
            "then restart your terminal."
        )

    # Step 1: Convert to standard WAV format using a temporary file
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp_wav:
        safe_wav_path = tmp_wav.name

    try:
        subprocess.run([
            FFMPEG_PATH, "-y", "-i", input_path,
            "-ar", "16000", "-ac", "1", "-f", "wav",
            safe_wav_path
        ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
        
        # Step 2: Load and normalize
        y, sr = librosa.load(safe_wav_path, sr=16000, mono=True)
        y = librosa.util.normalize(y)

        # Step 3: Noise reduction
        y = nr.reduce_noise(y=y, sr=sr)

        # Step 4: Trim silence from start & end (slightly tighter threshold)
        y_trimmed, _ = librosa.effects.trim(y, top_db=25)

        # Step 5: Dynamic range compression (using memory buffer)
        buffer = io.BytesIO()
        sf.write(buffer, y_trimmed, sr, format='WAV')
        buffer.seek(0)
        
        audio = AudioSegment.from_file(buffer, format="wav")
        compressed_audio = compress_dynamic_range(audio)

        final_path = "processed_audio.wav"
        compressed_audio.export(final_path, format="wav")

        return final_path

    except Exception as e:
        if isinstance(e, subprocess.CalledProcessError):
            error_output = e.stderr.decode(errors='ignore') if e.stderr else str(e)
            raise RuntimeError(f"ffmpeg failed: {error_output}")
        raise e
    finally:
        # Cleanup temporary file
        if os.path.exists(safe_wav_path):
            os.remove(safe_wav_path)