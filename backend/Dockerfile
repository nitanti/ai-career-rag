# Stage 1 - Builder
FROM python:3.10-slim as builder

WORKDIR /install

COPY requirements.txt .

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        tesseract-ocr \
    && rm -rf /var/lib/apt/lists/* && \
    python -m pip install --no-cache-dir --upgrade pip && \
    python -m pip install --no-cache-dir --prefix=/install -r requirements.txt && \
    rm -rf /tmp/* /root/.cache

# Stage 2 - Runtime
FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

ENV HF_HUB_DISABLE_XET=1 HF_HUB_ENABLE_HF_TRANSFER=0

WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        tesseract-ocr \
    && apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /root/.cache

COPY --from=builder /install /usr/local
COPY . .

RUN mkdir -p /tmp/hf_cache && chmod -R 777 /tmp/hf_cache

EXPOSE 7860

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]