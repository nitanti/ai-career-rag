from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from rag_pipeline import initialize_vectorstore, query_rag_with_resume
from typing import List

app = FastAPI()

# Allow CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the vector database at startup
vectorstore = initialize_vectorstore()


@app.get("/")
def read_root():
    return {"message": "RAG Backend is running."}


@app.post("/rag-query")
async def rag_query(question: str = Form(...), resume: UploadFile = File(None)):
    # If resume file is uploaded, parse it into additional context
    resume_text = ""
    if resume:
        content = await resume.read()
        resume_text = content.decode("utf-8", errors="ignore")

    answer = query_rag_with_resume(question, resume_text, vectorstore)
    return {"answer": answer}
