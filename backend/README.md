# Backend – ai-career-rag

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi&logoColor=white)
![LangChain](https://img.shields.io/badge/LangChain-blueviolet?style=for-the-badge)
![Groq](https://img.shields.io/badge/Groq-FF4B4B?style=for-the-badge)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Render](https://img.shields.io/badge/Render-00979D?style=for-the-badge)
![Railway](https://img.shields.io/badge/Railway-0B0D0E?style=for-the-badge&logo=railway)

This is the FastAPI backend for the AI-powered career assistant. It uses LangChain, FAISS, and Groq’s LLaMA3 to implement a Retrieval-Augmented Generation (RAG) system that can answer questions based on a user-uploaded resume.

🔗 [GitHub Repository](https://github.com/nitanti/ai-career-rag)

---

## 📚 Table of Contents

- [Features](#-features)
- [Setup (Local)](#️-setup-local)
- [Environment Variables](#-environment-variables)
- [Run Locally](#-run-locally)
- [Deployment (Railway + Docker)](#-deployment-railway--docker)
- [Deployment on Render (Docker)](#-deployment-on-render-docker)
- [Notes](#-notes)
- [Author](#-author)

---

## 🚀 Features

- Resume upload and PDF/DOCX/TXT/Image parsing
- Embedding and storage in FAISS vector store
- Groq LLaMA3-based Q&A with LangChain
- REST API with FastAPI (`/`, `/upload`, `/ask`)
- Docker-ready with Railway deployment support

---

## 🛠️ Setup (Local)

```bash
cd backend
python -m venv venv
source venv/bin/activate        # macOS/Linux
venv\Scripts\activate.bat     # Windows
pip install -r requirements.txt
```

---

## 🔐 Environment Variables

Create a `.env` file in the backend folder (for local use only):

```bash
GROQ_API_KEY=your_groq_api_key
DEBUG_MODE=true
FRONTEND_URL=http://localhost:3000
PORT=8000  # optional
```

On production (e.g. Render), set environment variables via the platform dashboard, e.g. Render dashboard:
- GROQ_API_KEY
- FRONTEND_URL

Note: Get your API key from [Groq Console](https://console.groq.com/keys)

---

## 🧪 Run Locally

```bash
python rag_pipeline.py
```

or if you prefer uvicorn:
```bash
uvicorn rag_pipeline:app --host 0.0.0.0 --port 8000
```

By default, the backend runs on port 8000 locally (Visit: http://localhost:8000), and you can override it with the `PORT` environment variable.

On production (e.g. Render), the server automatically reads the `$PORT` environment variable required by the platform.

---

## 🐳 Deployment (Railway + Docker)

```bash
cd backend
railway up      # or use Render
```

Ensure `.env` is present and `.dockerignore` excludes `venv/`, `__pycache__/`, etc.

---

## 🚀 Deployment on Render (Docker)

- Push to the `dev` branch
- Render auto-builds using `render.yaml` and `Dockerfile`

```bash
git add backend/Dockerfile render.yaml
git commit -m "feat: deploy-ready with logging and RAG chain"
git push origin dev
```

### Optional: Run via Docker (locally)

```bash
docker build -t ai-career-rag .
docker run -p 8000:8000 --env-file .env ai-career-rag
```

## 📌 Notes

- This project is under active development.
- Backend is powered by FastAPI, LangChain, Groq LLaMA3.
- Docker image is optimised using `.dockerignore`. Keep it clean to avoid exceeding build size.

---

## 👩‍💻 Author

**Nichella Annarisa Tanti** (Nichanan Tantiwatanapaisal)  
[GitHub](https://github.com/nitanti) | [LinkedIn](https://www.linkedin.com/in/nichellatanti/)
