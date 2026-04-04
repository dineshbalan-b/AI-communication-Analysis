# SpeakClear AI

SpeakClear AI is a premium, AI-driven communication analysis platform designed to help users master their verbal impact. By providing real-time audio and video analysis, SpeakClear identifies speech patterns, filler words, and delivers tailored AI coaching to transform how you speak.

![Architecture](System_architecture.png)

##  Core Features

- **Real-time Assessment**: Record audio or video responses to professional topics and get instant metrics.
- **Advanced Metrics**:
  - **WPM (Words Per Minute)**: Track your speaking pace.
  - **Filler Word Detection**: Identify and eliminate "um", "ah", and "like".
  - **Speech Ratio**: Analyze active speaking time vs. silence.
- **AI Coaching**: Receive personalized feedback and actionable improvement suggestions powered by LLMs.
- **Performance Tracking**: Visualize your growth over time with interactive charts and session history.
- **Premium UI**: A modern, dark-themed interface built with Next.js and Tailwind CSS.

##  Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/), [Tailwind CSS](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/)
- **Backend**: [FastAPI](https://fastapi.tiangolo.com/), [Uvicorn](https://www.uvicorn.org/)
- **AI/ML**: [OpenAI GPT](https://openai.com/), [Librosa](https://librosa.org/) (Audio Analysis)
- **Database**: [SQLite](https://www.sqlite.org/)
- **Processing**: [FFmpeg](https://ffmpeg.org/), MoviePy, Pydub

---

##  Getting Started

### 1. Prerequisites
- [Python 3.10+](https://www.python.org/downloads/)
- [Node.js 18+](https://nodejs.org/)
- [OpenAI API Key](https://platform.openai.com/api-keys)

### 2. Setup

#### Backend Setup
1. Open a terminal in the project root.
2. Create a virtual environment:
   ```bash
   python -m venv .venv
   ```
3. Activate the environment:
   - **Windows**: `.venv\Scripts\activate`
   - **Mac/Linux**: `source .venv/bin/activate`
4. Install dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```
5. Create a `.env` file in the `backend/` directory and add your key:
   ```env
   OPENAI_API_KEY=your_api_key_here
   ```

#### Frontend Setup
1. Navigate to the UI folder:
   ```bash
   cd speakclear-ui
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

---

##  Running the Application

### Option A: The Easy Way (Windows Only)
Run the provided PowerShell script to start both the backend and frontend simultaneously:
```powershell
./run_servers.ps1
```

### Option B: Manual Start (Separate Terminals)

**Terminal 1: Backend**
```bash
cd backend
uvicorn app:app --port 8010 --reload
```

**Terminal 2: Frontend**
```bash
cd speakclear-ui
npm run dev
```

The application will be available at **http://localhost:3000**.

---

