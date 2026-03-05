import os
import json
from dotenv import load_dotenv
from openai import OpenAI

# -------------------------------
# Load API Key
# -------------------------------

load_dotenv()
API_KEY = os.getenv("API_KEY")
BASE_URL = os.getenv("BASE_URL")
if not API_KEY:
    raise ValueError("API_KEY not found in .env file")

client = OpenAI(
    api_key=API_KEY,
    base_url=BASE_URL
)

# -------------------------------
# LLM Evaluation
# -------------------------------

def evaluate_with_llm(topic, transcript, audio_metrics, text_metrics):

    prompt = f"""
You are an expert communication and language evaluator.

Topic:
{topic}

Transcript:
{transcript}

Objective Metrics:
- Words per minute: {text_metrics['wpm']}
- Filler words: {text_metrics['filler_count']}
- Vocabulary richness: {text_metrics['vocab_richness']}
- Average pause: {audio_metrics['avg_pause']}
- Speech ratio: {audio_metrics['speech_ratio']}

Evaluate the speaker on:

1. Grammar accuracy (0-10)
2. Vocabulary sophistication (0-10)
3. Sentence structure quality (0-10)
4. Clarity of expression (0-10)
5. Confidence perception (0-10)
6. Topic relevance (0-10)
7. Overall communication score (0-10)

Then generate:
- A professional overall feedback paragraph (max 150 words)
- Clear improvement suggestions

Return strictly in valid JSON format:

{{
  "grammar": 0-10,
  "vocabulary": 0-10,
  "structure": 0-10,
  "clarity": 0-10,
  "confidence": 0-10,
  "relevance": 0-10,
  "overall": 0-10,
  "final_feedback": "...",
  "improvements": "..."
}}
"""

    response = client.chat.completions.create(
        model="gpt-4.1-nano",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3
    )

    content = response.choices[0].message.content
    return json.loads(content)


# -------------------------------
# Hybrid Score
# -------------------------------

def compute_hybrid_score(rule_score, llm_scores):

    llm_scaled = llm_scores["overall"] * 10  # convert 0-10 → 0-100
    final_score = (0.4 * rule_score) + (0.6 * llm_scaled)

    return round(final_score)


# -------------------------------
# Generate Spoken Feedback
# -------------------------------

def generate_spoken_feedback(llm_scores, hybrid_score):

    spoken_text = f"""
Here is your communication evaluation.

Your overall score is {hybrid_score} out of 100.

Grammar score: {llm_scores['grammar']} out of 10.
Vocabulary score: {llm_scores['vocabulary']} out of 10.
Clarity score: {llm_scores['clarity']} out of 10.
Confidence score: {llm_scores['confidence']} out of 10.
Relevance score: {llm_scores['relevance']} out of 10.

Overall feedback:
{llm_scores['final_feedback']}

Improvement suggestions:
{llm_scores['improvements']}
"""

    try:
        response = client.audio.speech.create(
            model="gpt-4o-mini-tts",
            voice="alloy",
            input=spoken_text
        )

        output_path = "final_feedback_audio.mp3"

        with open(output_path, "wb") as f:
            f.write(response.content)

        return output_path
    except Exception as e:
        print(f"Error generating spoken feedback: {e}")
        return None

# -------------------------------
# Generate Dynamic Topics
# -------------------------------

_TOPIC_CACHE = []
_LAST_FETCH_TIME = 0

def generate_topics(force_refresh=False):
    """
    Generates a list of 6 simple and everyday communication practice topics.
    Uses caching to avoid hitting the API on every request unless forced.
    """
    global _TOPIC_CACHE, _LAST_FETCH_TIME
    import time

    current_time = time.time()
    # Cache for 1 hour (3600 seconds)
    if not force_refresh and _TOPIC_CACHE and (current_time - _LAST_FETCH_TIME < 3600):
        return _TOPIC_CACHE

    try:
        seed = current_time
        prompt = f"""
        Generate 6 simple and everyday communication practice topics. 
        Each topic should be easy to talk about for 1-2 minutes.
        Include common daily scenarios (Hobby, Food, Travel, School/Work, Family).
        CRITICAL: Ensure all 6 topics are completely unique and different from each other.
        Variety hint: {seed}
        Return ONLY a JSON list of strings under key "topics".
        Example: {{"topics": ["My Favorite Hobby", "A Memorable Vacation", "How to Make Tea", "My Weekend Plans", "Favorite Childhood Movie", "My Best Friend"]}}
        """

        response = client.chat.completions.create(
            model="gpt-4.1-nano", # Using the smaller nano model for speed
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )

        import json
        res_text = response.choices[0].message.content
        data = json.loads(res_text)
        
        # Extract list regardless of key name used by AI
        if isinstance(data, list):
            _TOPIC_CACHE = data[:6]
        elif isinstance(data, dict):
            if "topics" in data:
                _TOPIC_CACHE = data["topics"][:6]
            else:
                for val in data.values():
                    if isinstance(val, list):
                        _TOPIC_CACHE = val[:6]
                        break
        
        if _TOPIC_CACHE:
            _LAST_FETCH_TIME = current_time
            return _TOPIC_CACHE
        
        return ["My Favorite Hobby", "A Memorable Trip", "The Best Meal I Had", "My Role Model", "Future Goals", "A Productive Day"]
        
    except Exception as e:
        print(f"Error generating topics: {e}")
        return ["My Favorite Hobby", "A Memorable Trip", "The Best Meal I Had", "My Role Model", "Future Goals", "A Productive Day"]