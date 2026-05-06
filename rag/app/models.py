from datetime import UTC, datetime

from beanie import Document, PydanticObjectId
from pydantic import Field


def _now() -> datetime:
    return datetime.now(UTC)


class IngestedDocument(Document):
    name: str
    createdAt: datetime = Field(default_factory=_now)
    updatedAt: datetime = Field(default_factory=_now)

    class Settings:
        name = "documents"


class Embedding(Document):
    text: str
    embedding: list[float]
    documentId: PydanticObjectId
    createdAt: datetime = Field(default_factory=_now)
    updatedAt: datetime = Field(default_factory=_now)

    class Settings:
        name = "embeddings"
