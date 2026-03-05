# Start the FastAPI Backend
Start-Process powershell -ArgumentList "-NoExit -Command `"cd backend; ..\.venv\Scripts\python.exe -m uvicorn app:app --host 127.0.0.1 --port 8001 --reload`""

# Start the Next.js Frontend
Start-Process powershell -ArgumentList "-NoExit -Command `"cd speakclear-ui; npm run dev`""

Write-Host "Both servers are starting in new windows."
Write-Host "FastAPI Backend runs on: http://127.0.0.1:8000"
Write-Host "Next.js Frontend runs on: http://localhost:3000"
