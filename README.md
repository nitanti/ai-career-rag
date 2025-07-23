# ai-career-rag

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi&logoColor=white)
![LangChain](https://img.shields.io/badge/LangChain-blueviolet?style=for-the-badge)
![Groq](https://img.shields.io/badge/Groq-FF4B4B?style=for-the-badge)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Railway](https://img.shields.io/badge/Railway-0B0D0E?style=for-the-badge&logo=railway)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs)
![Tailwind](https://img.shields.io/badge/Tailwind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

An AI-powered career assistant that uses Retrieval-Augmented Generation (RAG) with Groq's LLaMA3 and FAISS to provide personalised career guidance.  
Users can upload their resume and ask career-related questions, with responses grounded in their own experience.

🔗 [GitHub Repository](https://github.com/nitanti/ai-career-rag)

---

## 📚 Table of Contents

- [Live Demo](#-live-demo)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Local Backend Development](#-local-backend-development)
- [Deploy Backend with Docker + Railway](#-deploy-backend-with-docker--railway)
- [Frontend (Next.js)](#-frontend-nextjs)
- [Setup Frontend Locally](#-setup-frontend-locally)
- [Frontend-Backend Integration](#-frontend-backend-integration)
- [Frontend Deployment](#-frontend-deployment-optional)
- [Project Structure](#-project-structure)
- [Notes](#-notes)
- [Author](#-author)

---

## 🚀 Live Demo

🌐 Demo coming soon – check back later!

---

## ✨ Features

- RAG pipeline using LangChain, HuggingFace, FAISS
- Resume upload and PDF parsing
- LLM-powered Q&A with Groq LLaMA3
- Local document vector store using FAISS
- Docker-based deployment
- Railway CLI support for fast cloud deploy

---

## 🧠 Tech Stack

- FastAPI + Uvicorn
- LangChain + Groq (LLaMA3)
- HuggingFace Embeddings
- FAISS Vector Store
- Next.js + React + Tailwind CSS
- Railway + Docker

---

## 🧪 Local Backend Development

### 1. Clone the repo

```bash
git clone https://github.com/nitanti/ai-career-rag.git
cd ai-career-rag/backend
```

### 2. (Optional) Create a virtual environment

```bash
python -m venv venv
source venv/bin/activate   # macOS/Linux
venv\Scripts\activate.bat  # Windows
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Set up environment variables

Create a `.env` file in the `/backend` directory with:

```env
GROQ_API_KEY=your_groq_api_key
DEBUG_MODE=true
FRONTEND_URL=http://localhost:3000
PORT=8000       # optional
```

> 🔑 You can get your API key from: https://console.groq.com/keys

### 5. Run the backend app

```bash
python rag_pipeline.py
```

or if you prefer uvicorn:
```bash
uvicorn rag_pipeline:app --host 0.0.0.0 --port 8000
```

> Backend will be available at: http://localhost:8000

---

## 🐳 Deploy Backend with Docker + Railway

### 1. Install Railway CLI (if not installed)

```bash
npm install -g @railway/cli
# or
brew install railway  # for Homebrew users
```

### 2. Log in and initialise project

```bash
railway login
railway init
```

### 3. Deploy backend from `/backend`

```bash
cd backend
railway up
```

> ⚠️ Make sure `.env` exists and `.dockerignore` excludes heavy files like `venv/`, `__pycache__/`, `.ipynb_checkpoints/`, and large models to prevent build failures.

---

## 🧩 Frontend (Next.js)

The frontend is built with Next.js and provides:

- 📤 Resume upload (.PDF, .DOCX, .TXT, .JPG, .JPEG, .PNG)
- 💬 Question input for career queries
- 🧠 Real-time answer from backend LLM
- ⏳ Progress bar and loading UI

---

## ⚙️ Setup Frontend Locally

```bash
cd frontend
npm install
npm run dev
```

> App runs at: http://localhost:3000  
> Make sure backend is running on http://localhost:8000  
> If backend URL is different, update it in frontend config.

---

## 🔗 Frontend-Backend Integration

### API Endpoints

1. `POST /upload` – Uploads and parses resume documents, stores embeddings in FAISS.  
2. `POST /ask` – Sends a career-related question and gets a response from Groq LLaMA3 based on uploaded data.

> The frontend uses `NEXT_PUBLIC_API_URL` to connect to backend.

---

## 🚀 Frontend Deployment (optional)

Deploy frontend separately via:

- Vercel  
- Netlify  
- Or Railway (if monorepo setup is used)

### Example `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://your-backend-url.up.railway.app
```

---

## 📁 Project Structure

```bash
ai-career-rag/
├── backend/
│   ├── .env  # manual add for local use only
│   ├── rag_pipeline.py
│   ├── requirements.txt
│   ├── .render.yaml
│   ├── Dockerfile
│   ├── .dockerignore
│   └── ...
├── frontend/
│   ├── .env.local  # manual add for local use only
│   ├── public/
│   ├── src/
│   │   └── app/
│   ├── package.json
│   ├── README.md
│   └── ...
└── README.md
```

If deploying on Render, ensure `.render.yaml` and `Dockerfile` are included in your repo root.

---

## 📌 Notes

- This project is under active development.
- Backend is powered by FastAPI, LangChain, Groq LLaMA3.
- Docker image is optimised using `.dockerignore`. Keep it clean to avoid exceeding build size.

---

## 👩‍💻 Author

**Nichella Annarisa Tanti** (Nichanan Tantiwatanapaisal)  
[GitHub](https://github.com/nitanti) | [LinkedIn](https://www.linkedin.com/in/nichellatanti/)
