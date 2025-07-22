# Use a lightweight Python base image
FROM python:3.10-slim

# Environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libgl1 \
    poppler-utils \
    tesseract-ocr \
    libreoffice \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade pip \
 && pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Expose FastAPI on port 80
EXPOSE 80

# Run the FastAPI app (rag_pipeline contains /upload and /ask, main.py has /rag-query)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "80"]