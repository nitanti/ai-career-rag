# Stage 1 - Builder
FROM python:3.10-slim as builder

WORKDIR /install

COPY requirements.txt .

# Install build-time deps and Python packages
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        libpoppler-cpp-dev \
        tesseract-ocr \
        libgl1 \
    && rm -rf /var/lib/apt/lists/* && \
    python -m pip install --no-cache-dir --upgrade pip && \
    python -m pip install --no-cache-dir --prefix=/install -r requirements.txt && \
    rm -rf /tmp/* /root/.cache

# Stage 2 - Runtime
FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        libpoppler-cpp-dev \
        tesseract-ocr \
        libgl1 \
    && apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /root/.cache

COPY --from=builder /install /usr/local
COPY . .

EXPOSE 8000

CMD ["python", "rag_pipeline.py"]