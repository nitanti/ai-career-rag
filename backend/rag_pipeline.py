from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os
import tempfile
from dotenv import load_dotenv
import logging
import traceback

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
    UnstructuredImageLoader,
)

# Environment configuration
IS_DEV = os.getenv("DEBUG_MODE", "false").strip().lower() == "true"

if IS_DEV:
    load_dotenv()

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG if IS_DEV else logging.INFO)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
assert GROQ_API_KEY, "GROQ_API_KEY not found. Please set it in the .env file."

# FastAPI setup
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic schema
class QueryInput(BaseModel):
    question: str


# Global state
vectorstore = None
rag_chain = None


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
        loader = UnstructuredImageLoader(path)
    else:
        raise ValueError(
            "Please upload a supported file type: .pdf, .txt, .docx, .png, .jpg"
        )

    docs = loader.load()
    logger.info(f"Loaded {len(docs)} documents from: {path}")

    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=100)
    chunks = splitter.split_documents(docs)
    logger.info(f"Split into {len(chunks)} chunks")

    if IS_DEV:
        logger.debug(f"First chunk preview: {chunks[0].page_content[:200]}")

    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    return FAISS.from_documents(chunks, embeddings)


# Build RAG chain with prompt
def build_rag_chain(vstore):
    retriever = vstore.as_retriever()
    llm = ChatGroq(api_key=GROQ_API_KEY, model_name="llama3-8b-8192")

    system_prompt = """You are a highly experienced and insightful career advisor. You provide clear, realistic, and empowering guidance for people from all fields — including technology, healthcare, business, design, science, and education.

Your job is to:
- Analyse resume-like documents or user-provided background.
- Understand and interpret user questions about careers.
- Recommend career paths, job roles, learning steps, or transitions.
- Suggest next actions (e.g., what to research, where to apply, skills to build).

Avoid generic answers. Tailor your suggestions to the user's context. Use a warm and encouraging tone in professional English.
"""

    rag_prompt = PromptTemplate(
        input_variables=["context", "question"],
        template=(
            f"{system_prompt}\n\n"
            "Relevant Information:\n{context}\n\n"
            "User Question:\n{question}\n\n"
            "Career Advisor Answer:"
        ),
    )

    return RetrievalQA.from_chain_type(
        llm=llm,
        retriever=retriever,
        chain_type="stuff",
        chain_type_kwargs={"prompt": rag_prompt},
        return_source_documents=IS_DEV,
    )


# Upload endpoint
@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    global vectorstore, rag_chain
    temp_path = None
    try:
        contents = await file.read()
        suffix = os.path.splitext(file.filename)[-1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as f:
            f.write(contents)
            temp_path = f.name

        logger.info(f"Received file: {file.filename}")
        if IS_DEV:
            logger.debug(f"Temp file saved at: {temp_path}")

        vectorstore = process_documents(temp_path)
        rag_chain = build_rag_chain(vectorstore)

        if IS_DEV:
            logger.debug("Vectorstore and RAG chain created")

        try:
            num_docs = len(vectorstore.index_to_docstore_id)
        except Exception:
            num_docs = 0

        if num_docs == 0:
            raise ValueError("No documents were processed successfully.")

        return {
            "status": "ready",
            "files_uploaded": 1,
            "documents_loaded": num_docs,
            "message": "Upload success and RAG chain built",
        }

    except Exception as e:
        if IS_DEV:
            logger.exception("Traceback for upload failure:")
        else:
            logger.error("Upload failed", exc_info=True)
        return {"status": "error", "message": str(e).strip() or "Upload failed"}

    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
                logger.info(f"Temp file deleted: {temp_path}")
            except Exception as cleanup_err:
                logger.warning(f"Could not delete temp file: {cleanup_err}")


# Ask endpoint
@app.post("/ask")
async def ask(query: QueryInput):
    if not rag_chain:
        logger.warning("Attempted to query before uploading documents")
        return {"error": "Please upload documents first."}
    try:
        if IS_DEV:
            logger.debug(f"User query: {query.question}")

        response = rag_chain.invoke({"query": query.question})
        answer = (
            response["result"]
            if isinstance(response, dict) and "result" in response
            else str(response)
        )
        return {"question": query.question, "answer": answer}

    except Exception as e:
        if IS_DEV:
            message = str(e).strip() or "Unknown internal error."
            return {"error": message}
        else:
            logger.error("Unexpected error", exc_info=True)
            return {"error": "Something went wrong. Please try again later."}


# Run server locally
if __name__ == "__main__":
    uvicorn.run("rag_pipeline:app", host="0.0.0.0", port=8000, reload=True)
