from backend.llm_engine import generate_tts_audio

print("Testing generate_tts_audio directly...")
try:
    result = generate_tts_audio("Hello world!")
    if result:
        print("Success! Got bytes:", len(result))
    else:
        print("Failed: Function returned None. Check LLM engine logs.")
except Exception as e:
    print(f"Exception caught: {e}")
