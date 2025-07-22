# ai-career-rag

An AI-powered career assistant that uses Retrieval-Augmented Generation (RAG) with Groq's LLaMA3 and FAISS to provide personalised career guidance.  
Users can upload their resume and ask career-related questions, with responses grounded in their own experience.

GitHub Project URL: https://github.com/nitanti/ai-career-rag

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
```

> 🔑 You can get your API key from: https://console.groq.com/keys

### 5. Run the backend app

```bash
uvicorn main:app --reload
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

## 🔗 Frontend–Backend Integration

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
│   ├── main.py
│   ├── rag_pipeline.py
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── .dockerignore
│   └── ...
├── frontend/
│   ├── public/
│   ├── src/
│   │   └── app/
│   ├── package.json
│   ├── README.md
│   └── ...
└── README.md
```

---

## 📌 Notes

- This project is under active development.
- Backend is powered by FastAPI, LangChain, Groq LLaMA3.
- Docker image is optimised using `.dockerignore`. Keep it clean to avoid exceeding build size.

---

## 👩‍💻 Author

**Nichella Annarisa Tanti** (Nichanan Tantiwatanapaisal)  
[GitHub](https://github.com/nitanti) | [LinkedIn](https://www.linkedin.com/in/nichellatanti/)