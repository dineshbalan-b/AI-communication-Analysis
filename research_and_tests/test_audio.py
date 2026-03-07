import requests

url = "http://127.0.0.1:8010/api/generate-audio-feedback"
payload = {"text": "This is a test of the AI audio feedback generation system. If you can hear this, then the endpoint is working perfectly!"}

print(f"Sending request to {url}...")
try:
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Content-Type: {response.headers.get('content-type')}")
    
    if response.status_code == 200:
        output_file = "test_feedback.mp3"
        with open(output_file, "wb") as f:
            f.write(response.content)
        print(f"SUCCESS! Saved audio file to {output_file} ({len(response.content)} bytes).")
    else:
        print(f"Error details: {response.text}")
        
except Exception as e:
    print(f"Connection Error: {e}")
