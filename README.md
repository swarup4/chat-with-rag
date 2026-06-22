# Chat with RAG

A document Q&A app. Upload PDFs, ask questions, get answers grounded in your documents
with conversation memory.

**Stack:** Voyage `voyage-context-3` embeddings · Azure OpenAI (chat) · MongoDB Atlas Vector Search ·
LangChain · FastAPI · React · Node/Express.

This project is organized into three services:

1. **app/** — React frontend
2. **rag/** — Python RAG API (ingestion + Q&A)
3. **server/** — Node.js/Express API (auth, users, documents)

---

## Folder Structure

- **app/**: React frontend; talks to the RAG and server APIs.
- **rag/**: FastAPI RAG service — PDF ingest, Voyage embeddings, Atlas vector retrieval, Azure OpenAI answers.
- **server/**: Express backend — JWT auth, user management, document listing/deletion.
- **requestly/**: Importable API collection (`chat-with-rag.postman_collection.json`) for Requestly/Postman.

> Both the RAG service and the server use the **same MongoDB cluster and database (`trip`)** so the
> document UI and ingestion stay in sync.

---

## .env Configuration

Copy `rag/.env.example` to `rag/.env` and fill in real values. Key variables:

### 1. Python RAG API (`rag/.env`)
```bash
# Azure OpenAI — chat
AZURE_OPENAI_ENDPOINT="https://<resource>.openai.azure.com/"
AZURE_OPENAI_API_KEY="<key>"
AZURE_OPENAI_API_VERSION=2025-04-01-preview
AZURE_OPENAI_CHAT_DEPLOYMENT_NAME=gpt-5.4

# Voyage AI — embeddings (voyage-context-3, 1024-d)
VOYAGE_API_KEY="<key>"
VOYAGE_EMBEDDING_MODEL=voyage-context-3
EMBEDDING_DIMENSIONS=1024
VECTOR_INDEX_NAME=embedding_vector_index

# MongoDB Atlas
MONGODB_ATLAS_CLUSTER_URI="mongodb+srv://<user>:<password>@<cluster>.mongodb.net/"
MONGODB_DB_NAME=trip

# Optional: LangSmith tracing
LANGSMITH_TRACING=true
LANGSMITH_API_KEY="<key>"
LANGSMITH_PROJECT=chat-with-rag
```

### 2. Node.js API (`server/.env`)
```bash
PORT=3001
SECRATE_KEY='ragsecret'
MONGODB_URI='mongodb+srv://<user>:<password>@<cluster>.mongodb.net'
MONGODB_DB_NAME=trip
```

---

## How to Run Each Service

### 1. React App (`app/`) — port 3000
```bash
cd app
npm install
npm start
```

### 2. Python RAG API (`rag/`) — port 8080
```bash
cd rag
uv venv --python 3.12 .venv
uv pip install --python .venv -r requirements.txt
.venv/bin/python -m app.main
```
> First run only: build the Atlas vector index — `curl -X POST http://127.0.0.1:8080/init`

### 3. Node.js API (`server/`) — port 3001
```bash
cd server
npm install
npm run dev
```

---

## API Collection

Import `requestly/chat-with-rag.postman_collection.json` into Requestly or Postman
(**Import** → select the file) to get all endpoints with example bodies. Login auto-saves
the JWT for the authenticated routes.

---

## Docker Setup

Each service has its own Dockerfile. Run all together with Docker Compose:

```bash
docker compose up --build
```

---

## Project Author
Swarup Saha
