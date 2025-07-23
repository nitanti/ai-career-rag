# Frontend – ai-career-rag

This is the React + Next.js frontend for the AI-powered career assistant. It allows users to upload their resume and ask career-related enquiries.

---

## ✨ Features

- Resume upload: PDF, DOCX, TXT, PNG, JPG
- Input box for asking career questions
- Answers displayed from backend LLM
- Progress bar and loading indicators
- Modern interface with Tailwind CSS

---

## 🧩 Component Structure

- `UploadSection`: Resume upload and progress UI
- `QuestionSection`: Text input and Ask button
- `AnswerSection`: Display area for LLM response

---

## 🛠️ Setup (Local)

```bash
cd frontend
npm install
npm run dev
```

App runs at: http://localhost:3000

---

## 🔐 Environment Variables

Create a `.env.local` file:

```bash
NEXT_PUBLIC_API_BASE=http://localhost:8000
```

Point to the backend URL (Railway or localhost)

---

## ☁️ Deployment

Recommended: [Vercel](https://vercel.com)

Other options:
- Netlify
- Railway (if using monorepo)

Update `NEXT_PUBLIC_API_URL` before deploy.

---

## 📌 Notes

- This project is under active development.
- Backend provides:
   - Resume parsing and embedding
   - FAISS-based vector search
   - Retrieval-Augmented Generation (RAG) via Groq LLaMA3

---

## 👩‍💻 Author

**Nichella Annarisa Tanti** (Nichanan Tantiwatanapaisal)  
[GitHub](https://github.com/nitanti) | [LinkedIn](https://www.linkedin.com/in/nichellatanti/)