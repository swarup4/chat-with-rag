import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.rag_service import RAGService


class QARequest(BaseModel):
    question: str
    session_id: str = "default"


class QAResponse(BaseModel):
    answer: str


class IngestResponse(BaseModel):
    status: str
    document_ids: list[str]


class StatusResponse(BaseModel):
    status: str


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.rag = RAGService()
    yield


app = FastAPI(title="RAG API", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def index() -> dict[str, str]:
    return {"message": "Welcome to the RAG API"}


@app.post("/init", response_model=StatusResponse)
async def init_vector_store() -> StatusResponse:
    await app.state.rag.init_vector_store()
    return StatusResponse(status="vector index initialized")


@app.post("/ingest", response_model=IngestResponse)
async def ingest(files: list[UploadFile] = File(...)) -> IngestResponse:
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")
    doc_ids: list[str] = []
    for f in files:
        contents = await f.read()
        doc_id = await app.state.rag.ingest(f.filename or "unknown.pdf", contents)
        doc_ids.append(doc_id)
    return IngestResponse(status="Ingestion completed", document_ids=doc_ids)


@app.post("/qa", response_model=QAResponse)
async def qa(req: QARequest) -> QAResponse:
    answer = await app.state.rag.answer(req.question, req.session_id)
    return QAResponse(answer=answer)


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", 8080))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port)
