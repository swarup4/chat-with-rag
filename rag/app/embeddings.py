from __future__ import annotations

import asyncio
import os

import voyageai
from langchain_core.embeddings import Embeddings


class VoyageContextualEmbeddings(Embeddings):
    """voyage-context-3 contextualized chunk embeddings.

    embed_documents treats the input list as one document's ordered chunks, so each
    chunk is embedded with awareness of the others — the point of voyage-context-3.
    A whole document's chunks must therefore be passed in one call.
    """

    def __init__(
        self,
        model: str = "voyage-context-3",
        output_dimension: int = 1024,
        api_key: str | None = None,
    ) -> None:
        self.model = model
        self.output_dimension = output_dimension
        self._client = voyageai.Client(api_key=api_key or os.getenv("VOYAGE_API_KEY"))

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        result = self._client.contextualized_embed(
            inputs=[texts],
            model=self.model,
            input_type="document",
            output_dimension=self.output_dimension,
        )
        return result.results[0].embeddings

    def embed_query(self, text: str) -> list[float]:
        result = self._client.contextualized_embed(
            inputs=[[text]],
            model=self.model,
            input_type="query",
            output_dimension=self.output_dimension,
        )
        return result.results[0].embeddings[0]

    async def aembed_documents(self, texts: list[str]) -> list[list[float]]:
        return await asyncio.to_thread(self.embed_documents, texts)

    async def aembed_query(self, text: str) -> list[float]:
        return await asyncio.to_thread(self.embed_query, text)


if __name__ == "__main__":
    emb = VoyageContextualEmbeddings()
    chunks = ["Voyage context-3 embeds chunks.", "Each chunk sees its neighbors."]
    vecs = emb.embed_documents(chunks)
    print(f"{len(vecs)} vectors, dim={len(vecs[0])}")
    print(f"query dim={len(emb.embed_query('what is voyage-context-3?'))}")
