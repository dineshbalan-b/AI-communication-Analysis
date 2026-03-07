import numpy as np
import os
import subprocess
import os
import subprocess


# --------------------------------
# Extract Audio from Video
# --------------------------------
def extract_audio_from_video(video_path, output_audio_path="extracted_audio.wav"):
    from moviepy.editor import VideoFileClip
    video = VideoFileClip(video_path)
    video.audio.write_audiofile(output_audio_path, verbose=False, logger=None)
    return output_audio_path


# --------------------------------
# Energy-Based VAD
# --------------------------------
def apply_energy_vad(y, sr, frame_length=2048, hop_length=512, energy_threshold=0.02):
    import librosa

    energy = librosa.feature.rms(
        y=y, frame_length=frame_length, hop_length=hop_length
    )[0]

    speech_frames = energy > energy_threshold

    speech_indices = librosa.frames_to_samples(
        np.where(speech_frames)[0], hop_length=hop_length
    )

    speech_audio = []

    for idx in speech_indices:
        end = idx + hop_length
        speech_audio.extend(y[idx:end])

    speech_audio = np.array(speech_audio)

    speech_ratio = np.sum(speech_frames) / len(speech_frames) if len(speech_frames) > 0 else 0

    return speech_audio


# --------------------------------
# Main Preprocessing Function
# --------------------------------
def preprocess_audio(input_path):

    # Use ffmpeg directly to bypass any library detection heuristics.
    safe_wav_path = "temp_safe_format.wav"
    try:
        subprocess.run([
            "ffmpeg", "-y", "-i", input_path, 
            "-ar", "16000", "-ac", "1", "-f", "wav", 
            safe_wav_path
        ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
    except subprocess.CalledProcessError as e:
        error_output = e.stderr.decode(errors='ignore') if e.stderr else str(e)
        print(f"FFMPEG conversion failed: {error_output}")
        safe_wav_path = input_path
    except Exception as e:
        print(f"FFMPEG execution failed entirely: {e}")
        safe_wav_path = input_path

    import librosa
    import noisereduce as nr
    import soundfile as sf
    from pydub import AudioSegment
    from pydub.effects import compress_dynamic_range

    # Load audio using the standardized file
    y, sr = librosa.load(safe_wav_path, sr=16000, mono=True)

    # Normalize
    y = librosa.util.normalize(y)

    # Noise reduction
    y = nr.reduce_noise(y=y, sr=sr)

    # Trim only start & end silence (increased top_db to prevent cutting off quiet speech)
    y_trimmed, _ = librosa.effects.trim(y, top_db=30)

    # Save temporary VAD audio
    temp_vad_path = "temp_vad.wav"  
    sf.write(temp_vad_path, y_trimmed, sr)

    # Dynamic Range Compression
    audio = AudioSegment.from_file(temp_vad_path)
    compressed_audio = compress_dynamic_range(audio)

    final_path = "processed_audio.wav"
    compressed_audio.export(final_path, format="wav")

    # Remove temporary files
    if os.path.exists(temp_vad_path):
        os.remove(temp_vad_path)
    if os.path.exists(safe_wav_path) and safe_wav_path != input_path:
        os.remove(safe_wav_path)

    return final_path