from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os
import tempfile
import time
import uuid
from dotenv import load_dotenv
import logging
import pytesseract
from PIL import Image

# LangChain
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from langchain_groq import ChatGroq
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_community.document_loaders import (
    TextLoader,
    PyPDFLoader,
    UnstructuredWordDocumentLoader,
)
from langchain.schema import Document

# Fromtemd URL configuration
FRONTEND_URL = os.getenv("FRONTEND_URL", "*")

# Environment configuration
if os.path.exists(".env"):
    load_dotenv()
    IS_DEV = True
else:
    IS_DEV = False

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG if IS_DEV else logging.INFO)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
assert GROQ_API_KEY, "GROQ_API_KEY not found. Please set it in the .env file."

# Classifier constants - Stage 1
CAREER_WARNING = (
    "⚠️ This is not a career-related question. Please ask a career-focused question."
)

CLASSIFIER_PROMPT = """
You are a strict classifier that detects whether a user question is about careers.

Classify each question into ONE of:
- "career" > if the question is about jobs, career change, skills, education/training for work, job search, workplace challenges, or professional growth.
- "not-career" > if the question is unrelated to careers (e.g. weather, pets, entertainment, news, or general personal life).
- "unclear" > if the question is too vague, missing a clear topic, or lacks enough information to classify confidently.

Rules:
- Be strict but fair.
- If the user mentions a job, career goal, or skills for work, classify as "career".
- If the question starts with "I want", "I would like", etc., but lacks any job- or career-related detail, classify as "unclear".
- Always return exactly one word: career, not-career, or unclear.

Examples:
Q: I want  
A: unclear

Q: I want to  
A: unclear

Q: I want to be a doctor  
A: career

Q: I want to feel happy  
A: not-career

Q: What are the job prospects in AI?  
A: career

Q: Should I take a Python course for data science?  
A: career

Q: What’s your favourite movie?  
A: not-career

Q: I would like to improve  
A: unclear

Q: I would like to get into marketing  
A: career

Additional Rule:
- If the question uses a metaphor, slang, emoji, or symbolic word, try to interpret as a career if plausible.
  Examples:
  • "Can I become a star?" > career (actor, entertainer)
  • "Can I be a rockstar?" > career (musician or top performer in tech)
  • "I want to be a wizard at coding" > career (software engineer, expert)
  • "I want to be a social media queen" > career (influencer)
"""

# FastAPI setup
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic schema
class QueryInput(BaseModel):
    question: str


# Session store (multi-user support)
SESSIONS = (
    {}
)  # {session_id: {"vectorstore":..., "rag_chain":..., "last_used": time.time()}}
SESSION_TIMEOUT = 600  # seconds (10 minutes)

# global classifier LLM
CLASSIFIER_LLM = ChatGroq(api_key=GROQ_API_KEY, model_name="llama3-8b-8192")


def is_career_question(question: str) -> bool:
    """Stage 1: classify question as 'career' or 'not-career' using a few-shot prompt."""
    try:
        prompt = f"{CLASSIFIER_PROMPT}\nQ: {question}\nA:"
        resp = CLASSIFIER_LLM.invoke(prompt)
        text = getattr(resp, "content", str(resp)).strip().lower()
        # Accept answers that start with "career" and are not "not-career"
        return text.startswith("career")
    except Exception as e:
        # In case of classification failure, be conservative and allow RPA to proceed.
        logger.warning(f"Classifier error, defaulting to career: {e}")
        return True


# Cleanup expired sessions
def cleanup_sessions():
    now = time.time()
    expired = [
        sid for sid, s in SESSIONS.items() if now - s["last_used"] > SESSION_TIMEOUT
    ]
    for sid in expired:
        del SESSIONS[sid]
        logger.info(f"Session {sid} expired and deleted.")


# Backend health check
@app.get("/")
def root():
    return {
        "message": "RAG backend is running.",
        "mode": "development" if IS_DEV else "production",
    }


# Process uploaded document
def process_documents(path: str):
    if path.endswith(".pdf"):
        loader = PyPDFLoader(path)
    elif path.endswith(".txt"):
        loader = TextLoader(path)
    elif path.endswith(".docx"):
        loader = UnstructuredWordDocumentLoader(path)
    elif path.endswith((".png", ".jpg", ".jpeg")):
        try:
            img = Image.open(path)
            img = img.convert("RGB")
            img = img.resize((img.width // 2, img.height // 2))

            text = pytesseract.image_to_string(img).strip()
            logger.info(f"OCR text length: {len(text)}")

            # Check if OCR found no text
            if not text:
                raise ValueError("The uploaded image has no readable text.")

            docs = [Document(page_content=text)]

        except Exception as e:
            logger.error(f"OCR failed: {e}")
            raise ValueError("OCR failed or no text detected.")

        splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=100)
        chunks = splitter.split_documents(docs)

        # Check if chunks are empty
        if not chunks:
            raise ValueError("No readable content found in the image file.")

        embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )
        return FAISS.from_documents(chunks, embeddings)
    else:
        raise ValueError(
            "Please upload a supported file type: .pdf, .txt, .docx, .png, .jpg"
        )

    docs = loader.load()

    # Check if docs are empty or contain no text
    if not docs or all(not d.page_content.strip() for d in docs):
        raise ValueError("The uploaded document has no readable text.")

    logger.info(f"Loaded {len(docs)} documents from: {path}")

    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=100)
    chunks = splitter.split_documents(docs)
    logger.info(f"Split into {len(chunks)} chunks")

    # Check if chunks are empty
    if not chunks:
        raise ValueError("No readable content found in the document.")

    if IS_DEV:
        logger.debug(f"First chunk preview: {chunks[0].page_content[:200]}")

    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    return FAISS.from_documents(chunks, embeddings)


# Build RAG chain with prompt (Stage 2: RPA only — gate removed)
def build_rag_chain(vstore):
    retriever = vstore.as_retriever()
    llm = ChatGroq(api_key=GROQ_API_KEY, model_name="llama3-8b-8192", max_tokens=2048)

    system_prompt = """
You are a highly experienced and insightful career advisor.

Your role is to give clear, realistic, empowering, and structured career advice to people from all fields and career stages—students, early professionals, career changers, and more—across diverse industries such as technology, healthcare, business, design, science, and education.

PURPOSE & METHOD:
1. Understand the user's background, resume, or question (if provided).
2. Identify their career stage, goal, and relevant strengths, gaps, or constraints.
3. Recommend actionable steps, roadmaps, and realistic career options—even for ambitious or unconventional paths.

PERSONALITY & STYLE:
- Warm, encouraging, and professional.
- Direct and practical, but never generic.
- Adapt to the user’s tone, goal, and context.
- Concise and structured—avoid unnecessary repetition or fluff.

COMMUNICATION RULES:
- Use the Reason > Plan > Answer (RPA) framework:
  
1) Reason – Identify user’s stage, goal, and possible pathways.
2) Plan – Suggest a primary and a backup career path, including:
    - Role progression
    - Skills & certifications
    - KPIs or outcomes
    - Projects or initiatives
    - Networking tips
3) Answer – Respond in a friendly, structured format.  
   Use these **emoji-based headings** for clarity:

🎯 Career Path (Primary & Backup)  
📚 Skills & Certifications to Build  
📊 KPIs & Evidence  
🛠 Projects to Demonstrate Value  
🌐 Networking & Visibility  
🗓 Roadmap (30/60/90 days + 6–12 months)

- Do not repeat the user’s question.
- Use emojis sparingly (1–2 max) to enhance warmth, clarity, or light humour in content.
- Refer to the user by name **only if the name appears in the current input or document**. 
- If no name is clearly mentioned, default to addressing them as “you”.
- Never use names from previous questions or history unless explicitly present again.

ADVANCED INTERPRETATION:
- Always try to interpret vague, metaphorical, humorous, slang, or abbreviated questions as possible career goals.
Examples:
- “Can I become a star?” > actor, entertainer
- “Can I be a rockstar?” > top performer in tech, music, or creative fields
- “I want to be a wizard at coding” > software engineer or expert
- “I want to be a social media queen” > influencer, content strategist
- Treat informal or whimsical phrasing seriously unless clearly nonsensical.
- Ask for clarification **only if absolutely necessary** (i.e., multiple interpretations are equally likely and career link is unclear).
- Never respond “This is not a career question” unless there is truly no reasonable way to interpret it career-related.

Avoid:
- Legal disclaimers, branding, emails, or sign-offs.
- Repeating the user's input.
- Dismissive or robotic responses.

Your answer must always be:
- Motivational yet grounded in reality
- Specific and tailored
- Structured and complete (never cut off)
"""

    rag_prompt = PromptTemplate(
        input_variables=["context", "question"],
        template=(
            f"{system_prompt}\n\n"
            "Relevant Information:\n{context}\n\n"
            "User Question:\n{question}\n\n"
            "Write the full actionable answer **first** (no heading), then optionally show Reason and Plan sections below if relevant. Do not include the word 'Answer:' or any headings like 'Reason:' or 'Plan:' – just structure it with bullet points or short paragraphs."
        ),
    )

    return RetrievalQA.from_chain_type(
        llm=llm,
        retriever=retriever,
        chain_type="stuff",
        chain_type_kwargs={"prompt": rag_prompt},
        return_source_documents=IS_DEV,
    )


# Upload endpoint (now returns session_id)
@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    # Clean up expired sessions before starting
    cleanup_sessions()
    temp_path = None
    try:
        # Save the uploaded file as a temporary file
        contents = await file.read()
        suffix = os.path.splitext(file.filename)[-1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as f:
            f.write(contents)
            temp_path = f.name

        logger.info(f"Received file: {file.filename}")
        if IS_DEV:
            logger.debug(f"Temp file saved at: {temp_path}")

        # Process the uploaded file and build vectorstore + RAG chain
        vectorstore = process_documents(temp_path)
        rag_chain = build_rag_chain(vectorstore)

        # Check if any documents were successfully processed
        try:
            num_docs = len(vectorstore.index_to_docstore_id)
        except Exception:
            num_docs = 0

        if num_docs == 0:
            raise ValueError("No documents were processed successfully.")

        # Generate a unique session_id for this user/session
        session_id = str(uuid.uuid4())

        # Store vectorstore and rag_chain in SESSIONS dict with last_used timestamp
        SESSIONS[session_id] = {
            "vectorstore": vectorstore,
            "rag_chain": rag_chain,
            "last_used": time.time(),
        }

        # Return session_id and success message to frontend
        return {
            "status": "ready",
            "session_id": session_id,  # <-- Session ID sent back here
            "files_uploaded": 1,
            "documents_loaded": num_docs,
            "message": "Upload success and RAG chain built",
        }

    except Exception as e:
        # Log error details
        if IS_DEV:
            logger.exception("Traceback for upload failure:")
        else:
            logger.error("Upload failed", exc_info=True)

        # Return error response to frontend
        return {"status": "error", "message": str(e).strip() or "Upload failed"}

    finally:
        # Always delete the temporary file after processing (security)
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
                logger.info(f"Temp file deleted: {temp_path}")
            except Exception as cleanup_err:
                logger.warning(f"Could not delete temp file: {cleanup_err}")


# Ask endpoint (2-stage logic)
@app.post("/ask/{session_id}")
async def ask(session_id: str, query: QueryInput):
    # Clean up expired sessions
    cleanup_sessions()

    # If session is invalid or expired, return error
    if session_id not in SESSIONS:
        logger.warning("Invalid or expired session")
        return {"error": "Session expired or invalid. Please upload documents again."}

    try:
        # Stage 1: classify question
        if not is_career_question(query.question):
            return {"question": query.question, "answer": CAREER_WARNING}

        # Retrieve the correct session's RAG chain and refresh last_used timestamp
        session = SESSIONS[session_id]
        session["last_used"] = time.time()  # Update last used time

        if IS_DEV:
            logger.debug(f"User query: {query.question}")

        # Stage 2: run the RAG chain for this session
        response = session["rag_chain"].invoke({"query": query.question})
        answer = (
            response["result"]
            if isinstance(response, dict) and "result" in response
            else str(response)
        )

        # Return the answer to the frontend
        return {"question": query.question, "answer": answer}

    except Exception as e:
        # Handle unexpected errors
        if IS_DEV:
            return {"error": str(e).strip() or "Unknown internal error."}
        else:
            logger.error("Unexpected error", exc_info=True)
            return {"error": "Something went wrong. Please try again later."}


# Run server locally
if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    logger.info(f"Starting server on port {port}")
    uvicorn.run("rag_pipeline:app", host="0.0.0.0", port=port, reload=IS_DEV)
