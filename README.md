# Chat with RAG

This project is organized into three main folders:

1. **app/** - React Frontend Application
2. **rag/** - Python RAG (Retrieval-Augmented Generation) API
3. **server/** - Node.js Backend API

---

## Folder Structure

- **app/**: Contains the React frontend. Built with React and communicates with the backend APIs.
- **rag/**: Contains the Python-based RAG API for document retrieval and question answering.
- **server/**: Contains the Node.js/Express backend API for authentication, user management, and document handling.

---

## .env Configuration

### 1. Python RAG API (`rag/.env`)
```bash
HUGGINGFACEHUB_ACCESS_TOKEN = ""
MONGODB_ATLAS_CLUSTER_URI='mongodb+srv://admin:*****@*****.32bo0b5.mongodb.net'
```

### 2. Node.js API (`server/.env`)
```bash
PORT=3001
SECRATE_KEY='ragsecret'
MONGODB_URI='mongodb+srv://admin:*****@*****.32bo0b5.mongodb.net'
MONGODB_DB_NAME=llm
```

---

## How to Run Each Service

### 1. React App (`app/`)
```bash
cd app
npm install
npm start
```

### 2. Python RAG API (`rag/`)
```bash
cd rag
pip install -r requirements.txt
python -m app.main
```

### 3. Node.js API (`server/`)
```bash
cd server
npm install
npm run dev
```

---

## Docker Setup

Each service has its own Dockerfile. You can run all services together using Docker Compose.

### Build and Run All Services
```bash
docker compose up --build
```

---

## Project Author
Swarup Saha
