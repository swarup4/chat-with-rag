# Dockerfile for Python RAG API
FROM python:3.12-slim
WORKDIR /rag
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 6000
CMD ["python", "-m", "app.main"]
