from __future__ import annotations

import asyncio
from collections.abc import Sequence

import voyageai
from langchain_core.callbacks import Callbacks
from langchain_core.documents import Document
from langchain_core.documents.compressor import BaseDocumentCompressor
from pydantic import PrivateAttr


class VoyageReranker(BaseDocumentCompressor):
    """Reorders retrieved candidates by relevance using Voyage rerank, keeping top_n."""

    model: str = "rerank-2.5"
    top_n: int = 6
    _client: voyageai.Client = PrivateAttr(default_factory=voyageai.Client)

    def compress_documents(
        self,
        documents: Sequence[Document],
        query: str,
        callbacks: Callbacks | None = None,
    ) -> Sequence[Document]:
        docs = list(documents)
        if not docs:
            return []
        result = self._client.rerank(
            query=query,
            documents=[d.page_content for d in docs],
            model=self.model,
            top_k=self.top_n,
        )
        return [docs[r.index] for r in result.results]

    async def acompress_documents(
        self,
        documents: Sequence[Document],
        query: str,
        callbacks: Callbacks | None = None,
    ) -> Sequence[Document]:
        return await asyncio.to_thread(self.compress_documents, documents, query, callbacks)
