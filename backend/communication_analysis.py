import re
import numpy as np
import librosa


# Audio Analysis


def analyze_audio(audio_path):
    """
    Extract audio metrics from a WAV file:
    - Vectorized pause statistics (NumPy)
    - Speech ratio
    - Efficient pitch variance
    """
    y, sr = librosa.load(audio_path, sr=16000, mono=True)
    duration = librosa.get_duration(y=y, sr=sr)

    # Compute short-term energy (RMS)
    hop_length = 512
    rms = librosa.feature.rms(y=y, frame_length=2048, hop_length=hop_length)[0]

    # Classify frames as speech or silence
    # Absolute floor: if mean energy is very low, it's just silence/noise
    mean_rms = np.mean(rms)
    if mean_rms < 0.001:  # Absolute floor for silence
        return {
            "duration": duration,
            "speech_ratio": 0.0,
            "total_pause_time": duration,
            "avg_pause": duration,
            "max_pause": duration,
            "pause_count": 1,
            "pitch_variance": 0,
            "energy_variance": 0,
        }

    silence_threshold = max(mean_rms * 0.5, 0.0005)  # Cap threshold floor
    is_silence = (rms < silence_threshold).astype(int)
    speech_ratio = 1.0 - np.mean(is_silence)

    # Vectorized Pause Detection (Transitions)
    # Find where silence starts (0->1) and ends (1->0)
    diff = np.diff(np.concatenate(([0], is_silence, [0])))
    starts = np.where(diff == 1)[0]
    ends = np.where(diff == -1)[0]
    
    frame_duration = hop_length / sr
    pause_durations = (ends - starts) * frame_duration
    
    # Filter out extremely short "micro-pauses" < 100ms
    pause_durations = pause_durations[pause_durations > 0.1]

    # Efficient Pitch Tracking
    pitches, magnitudes = librosa.piptrack(y=y, sr=sr, hop_length=hop_length)
    # Get strongest pitch per frame
    pitch_values = []
    for t in range(pitches.shape[1]):
        index = magnitudes[:, t].argmax()
        pitch = pitches[index, t]
        if pitch > 0:
            pitch_values.append(pitch)
    
    pitch_variance = np.var(pitch_values) if pitch_values else 0

    return {
        "duration": duration,
        "speech_ratio": speech_ratio,
        "total_pause_time": np.sum(pause_durations),
        "avg_pause": np.mean(pause_durations) if len(pause_durations) > 0 else 0,
        "max_pause": np.max(pause_durations) if len(pause_durations) > 0 else 0,
        "pause_count": len(pause_durations),
        "pitch_variance": pitch_variance,
        "energy_variance": np.var(rms),
    }



# Text Analysis


def analyze_text(transcript, speaking_time_seconds):
    """
    Extract text metrics from transcript using regex word boundaries.
    """
    transcript = transcript.lower()
    words = re.findall(r'\b\w+\b', transcript)
    total_words = len(words)

    # Words per minute
    minutes = speaking_time_seconds / 60
    wpm = total_words / minutes if minutes > 0 else 0

    # Filler words - Using word boundaries for accuracy
    filler_words = ["um", "uh", "like", "you know", "actually", "basically"]
    filler_count = 0
    for filler in filler_words:
        # Avoid double-counting "you know" vs "know"
        pattern = rf'\b{re.escape(filler)}\b'
        filler_count += len(re.findall(pattern, transcript))

    # Vocabulary richness
    vocab_richness = len(set(words)) / total_words if total_words > 0 else 0

    # Sentence length
    sentences = [s.strip() for s in re.split(r'[.!?]', transcript) if s.strip()]
    avg_sentence_length = total_words / len(sentences) if sentences else 0

    return {
        "total_words": total_words,
        "wpm": wpm,
        "filler_count": filler_count,
        "vocab_richness": vocab_richness,
        "avg_sentence_length": avg_sentence_length,
    }



# Rule-Based Communication Score


def compute_communication_score(audio_metrics, text_metrics):
    """
    Compute a communication score (0-100).
    """
    score = 0

    # Fluency (WPM)
    if 110 <= text_metrics["wpm"] <= 160:
        score += 20
    elif 90 <= text_metrics["wpm"] <= 180:
        score += 15
    else:
        score += 5

    # Pause control
    score += 15 if audio_metrics["avg_pause"] < 1.5 else 5

    # Filler usage
    score += 15 if text_metrics["filler_count"] <= 2 else 5

    # Vocabulary
    score += 15 if text_metrics["vocab_richness"] > 0.6 else 8

    # Pitch variation
    score += 15 if audio_metrics["pitch_variance"] > 30 else 5

    # Speech ratio
    if 0.65 <= audio_metrics["speech_ratio"] <= 0.9:
        score += 20
    else:
        score += 10

    return min(score, 100)