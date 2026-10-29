# APPU  AI — Web Starter

A text AI agent starter with chat, decision support, memory, tasks, and image tools.

🌐 Live Website: https://appu-ai.vercel.app/

## Requirements
- Python 3.10+
- Node.js 20+
- VS Code (optional)

## Run on Windows

### Backend (PowerShell terminal 1)
```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload
```
API docs: http://127.0.0.1:8000/docs

### Frontend (PowerShell terminal 2)
```powershell
cd frontend
npm install
npm run dev
```
Open the URL Vite prints, usually http://localhost:5173.

## Enable AI replies
Put your AI provider key in `backend/.env` as `OPENAI_API_KEY=...` and set `OPENAI_MODEL=gpt-4o-mini`. Restart the backend. Keep keys out of frontend code and Git.

Without a key, demo responses are used so you can test the interface.

## Image tools
Collage creation uses Pillow. Background removal is optional; in the backend venv run `pip install rembg` if compatible with your setup. If it is not installed, the app explains that instead of pretending to remove the background.

## Current scope
This is a starter, not a fully autonomous JARVIS. It does not control your computer or run arbitrary commands. AI image generation and advanced generative editing need an additional compatible service. Memory and tasks are stored locally in SQLite. Do not store passwords or sensitive information.
