from pydantic import BaseModel
from typing import List, Optional

class IngestResponse(BaseModel):
    status: str
    document_id: str

class QARequest(BaseModel):
    question: str
    document_ids: Optional[List[str]] = None

class QAResponse(BaseModel):
    answer: str

class DocumentInfo(BaseModel):
    id: str
    name: str 