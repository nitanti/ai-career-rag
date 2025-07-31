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
Users can upload their CV/resume and ask career-related questions, with responses grounded in their own experience.

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

🌐 Live demo on Vercel - [Live Demo](https://ai-career-rag.vercel.app)

---

## ✨ Features

- RAG pipeline using LangChain, HuggingFace, FAISS
- CV/Resume upload and PDF parsing
- LLM-powered Q&A with Groq LLaMA3
- FAISS-powered local vector store for resume chunks
- Docker-based deployment
- Railway CLI support for fast cloud deploy
- Supports **image-based resume upload with OCR** (PNG, JPG, JPEG)
- **Session-aware backend** (auto-expire after 10 minutes, prompts for re-upload)
- **Interprets slang, metaphor, and informal career questions**
  (e.g., “Can I be a rockstar?”, “I want to be a wizard at coding”)
- **Emoji-based structured answers** for clearer readability

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

- 📤 CV/Resume upload (.PDF, .DOCX, .TXT, .JPG, .JPEG, .PNG)
- 💬 Question input for career queries
- 🧠 Real-time answer from backend LLM
- ⏳ Progress bar and loading UI
- 🔄 Session expiration → disables input + shows re-upload prompt
- 🧹 Auto-clearing file input after successful upload
- 📊 Visual progress bar for uploads

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

#### 1️⃣ `POST /upload`

- 📤 Uploads and parses CV/resume documents (PDF, DOCX, TXT, PNG, JPG, JPEG)
- 🧾 Stores embeddings in FAISS vector store
- 🖼 Supports OCR for image files before embedding
- ⚡ Returns a unique `session_id` for follow-up questions

#### 2️⃣ `POST /ask/{session_id}`

- 💬 Sends a career-related question and receives an LLM-powered answer
- 🎯 Returns **structured answers with emoji headings**
- 🙋 Falls back to addressing the user as **“you”** if no name is detected
- 🪄 Handles metaphor, slang, and informal career expressions automatically

> ⚙️ The frontend connects to these endpoints using the `NEXT_PUBLIC_API_BASE` environment variable.

---

### 🧩 Frontend Component Structure

- `UploadSection.tsx`: Handles CV/resume upload and progress bar
- `QuestionSection.tsx`: Input box for user queries
- `AnswerSection.tsx`: Displays LLM-generated response

---

## 🚀 Frontend Deployment (optional)

Deploy frontend separately via:

- Vercel
- Netlify
- Or Railway (if monorepo setup is used)

### Example `.env.local`:

```env
NEXT_PUBLIC_API_BASE=https://your-backend-url.up.railway.app    # or http://localhost:3000
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
│   │       └── page.tsx
│   │       └── ...
│   │   └── components/
│   │       └── AnswerSection.tsx
│   │       └── QuestionSection.tsx
│   │       └── UploadSection.tsx
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
