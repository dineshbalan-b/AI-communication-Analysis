import librosa
import numpy as np
import re


# --------------------------------
# AUDIO ANALYSIS
# --------------------------------

def analyze_audio(audio_path):

    y, sr = librosa.load(audio_path, sr=16000, mono=True)

    duration = librosa.get_duration(y=y, sr=sr)

    # Short-term energy
    frame_length = 2048
    hop_length = 512

    rms = librosa.feature.rms(
        y=y,
        frame_length=frame_length,
        hop_length=hop_length
    )[0]

    # Silence threshold
    silence_threshold = np.mean(rms) * 0.5

    silence_frames = rms < silence_threshold
    speech_frames = rms >= silence_threshold

    total_frames = len(rms)
    silence_ratio = np.sum(silence_frames) / total_frames
    speech_ratio = np.sum(speech_frames) / total_frames

    # Pause durations
    pause_durations = []
    current_pause = 0

    frame_duration = hop_length / sr

    for is_silence in silence_frames:
        if is_silence:
            current_pause += frame_duration
        else:
            if current_pause > 0:
                pause_durations.append(current_pause)
                current_pause = 0

    if current_pause > 0:
        pause_durations.append(current_pause)

    total_pause_time = sum(pause_durations)
    avg_pause = np.mean(pause_durations) if pause_durations else 0
    max_pause = max(pause_durations) if pause_durations else 0
    pause_count = len(pause_durations)

    # Pitch variation (confidence indicator)
    pitches, magnitudes = librosa.piptrack(y=y, sr=sr)
    pitch_values = pitches[magnitudes > np.median(magnitudes)]

    pitch_variance = np.var(pitch_values) if len(pitch_values) > 0 else 0

    # Energy variation
    energy_variance = np.var(rms)

    return {
        "duration": duration,
        "speech_ratio": speech_ratio,
        "total_pause_time": total_pause_time,
        "avg_pause": avg_pause,
        "max_pause": max_pause,
        "pause_count": pause_count,
        "pitch_variance": pitch_variance,
        "energy_variance": energy_variance
    }


# --------------------------------
# TEXT ANALYSIS
# --------------------------------

def analyze_text(transcript, speaking_time_seconds):

    transcript = transcript.lower()

    words = re.findall(r'\b\w+\b', transcript)
    total_words = len(words)

    # Words per minute
    minutes = speaking_time_seconds / 60
    wpm = total_words / minutes if minutes > 0 else 0

    # Filler words
    filler_words = ["um", "uh", "like", "you know", "actually", "basically"]
    filler_count = sum(transcript.count(filler) for filler in filler_words)

    # Vocabulary richness
    unique_words = len(set(words))
    vocab_richness = unique_words / total_words if total_words > 0 else 0

    # Sentence analysis
    sentences = re.split(r'[.!?]', transcript)
    sentences = [s.strip() for s in sentences if s.strip()]

    avg_sentence_length = (
        total_words / len(sentences) if len(sentences) > 0 else 0
    )

    return {
        "total_words": total_words,
        "wpm": wpm,
        "filler_count": filler_count,
        "vocab_richness": vocab_richness,
        "avg_sentence_length": avg_sentence_length
    }


# --------------------------------
# FINAL COMMUNICATION SCORE
# --------------------------------

def compute_communication_score(audio_metrics, text_metrics):

    score = 0

    # Fluency scoring (WPM)
    if 110 <= text_metrics["wpm"] <= 160:
        score += 20
    elif 90 <= text_metrics["wpm"] <= 180:
        score += 15
    else:
        score += 5

    # Pause control
    if audio_metrics["avg_pause"] < 1.5:
        score += 15
    else:
        score += 5

    # Filler usage
    if text_metrics["filler_count"] <= 2:
        score += 15
    else:
        score += 5

    # Vocabulary richness
    if text_metrics["vocab_richness"] > 0.6:
        score += 15
    else:
        score += 8

    # Pitch variation (avoid monotone)
    if audio_metrics["pitch_variance"] > 50:
        score += 15
    else:
        score += 5

    # Speech ratio
    if 0.65 <= audio_metrics["speech_ratio"] <= 0.9:
        score += 20
    else:
        score += 10

    return min(score, 100)