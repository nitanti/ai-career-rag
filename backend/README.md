# Backend – ai-career-rag

This is the FastAPI backend for the AI-powered career assistant. It uses LangChain, FAISS, and Groq’s LLaMA3 to implement a Retrieval-Augmented Generation (RAG) system that can answer questions based on a user-uploaded resume.

GitHub Project URL: https://github.com/nitanti/ai-career-rag

---

## 🚀 Features

- Resume upload and PDF/DOCX/TXT/Image parsing
- Embedding and storage in FAISS vector store
- Groq LLaMA3-based Q&A with LangChain
- REST API with FastAPI (`/upload`, `/ask`)
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

Create a `.env` file in the backend folder:

```bash
GROQ_API_KEY=your_groq_api_key
```

Get your API key from [Groq Console](https://console.groq.com/keys)

---

## 🧪 Run Locally

```bash
uvicorn main:app --reload
```

Visit: http://localhost:8000

---

## 🐳 Deployment (Railway + Docker)

```bash
cd backend
railway up
```

Ensure `.env` is present and `.dockerignore` excludes `venv/`, `__pycache__/`, etc.

---

## 📌 Notes

- This project is under active development.
- Backend is powered by FastAPI, LangChain, Groq LLaMA3.
- Docker image is optimised using `.dockerignore`. Keep it clean to avoid exceeding build size.

---

## 👩‍💻 Author

**Nichella Annarisa Tanti** (Nichanan Tantiwatanapaisal)  
[GitHub](https://github.com/nitanti) | [LinkedIn](https://www.linkedin.com/in/nichellatanti/)
