from __future__ import annotations

import hashlib
import json
import time

import numpy as np
import redis.asyncio as redis
from redis.commands.search.field import NumericField, TextField, VectorField
from redis.commands.search.index_definition import IndexDefinition, IndexType
from redis.commands.search.query import Query

CacheHit = tuple[str, str]  # (answer, cache_type) where cache_type is "exact" | "semantic"


class SemanticCache:
    """Two-layer query cache. L1 = exact normalized-query match; L2 = vector KNN.

    Single shared cache (no per-user scoping). Stores the query embedding so
    semantically-equivalent questions reuse the answer without calling the LLM.
    """

    def __init__(
        self,
        redis_url: str,
        dim: int,
        threshold: float = 0.95,
        ttl: int = 86_400,
        index_name: str = "qa_cache_idx",
    ) -> None:
        self._r = redis.from_url(redis_url, decode_responses=False)
        self._dim = dim
        self._threshold = threshold
        self._ttl = ttl
        self._index = index_name
        self._l1 = "qa:l1:"   # exact-match strings (not indexed)
        self._l2 = "qa:l2:"   # vector hashes (indexed)
        self._ready = False

    async def _ensure_index(self) -> None:
        if self._ready:
            return
        try:
            await self._r.ft(self._index).info()
        except Exception:
            schema = (
                VectorField(
                    "embedding",
                    "FLAT",
                    {"TYPE": "FLOAT32", "DIM": self._dim, "DISTANCE_METRIC": "COSINE"},
                ),
                TextField("answer"),
                NumericField("created"),
            )
            await self._r.ft(self._index).create_index(
                schema,
                definition=IndexDefinition(prefix=[self._l2], index_type=IndexType.HASH),
            )
        self._ready = True

    @staticmethod
    def _normalize(query: str) -> str:
        return " ".join(query.strip().lower().split())

    def _l1_key(self, query: str) -> str:
        return self._l1 + hashlib.sha256(self._normalize(query).encode()).hexdigest()

    @staticmethod
    def _to_bytes(vec: list[float]) -> bytes:
        return np.asarray(vec, dtype=np.float32).tobytes()

    async def get(self, query: str, query_embedding: list[float]) -> CacheHit | None:
        await self._ensure_index()

        exact = await self._r.get(self._l1_key(query))
        if exact is not None:
            return exact.decode(), "exact"

        knn = (
            Query("*=>[KNN 1 @embedding $vec AS dist]")
            .sort_by("dist")
            .return_fields("answer", "dist")
            .dialect(2)
        )
        res = await self._r.ft(self._index).search(
            knn, query_params={"vec": self._to_bytes(query_embedding)}
        )
        if res.docs:
            doc = res.docs[0]
            similarity = 1.0 - float(doc.dist)  # COSINE distance -> similarity
            if similarity >= self._threshold:
                answer = doc.answer
                return (answer.decode() if isinstance(answer, bytes) else answer), "semantic"
        return None

    async def set(
        self, query: str, answer: str, query_embedding: list[float], doc_ids: list[str]
    ) -> None:
        await self._ensure_index()

        await self._r.set(self._l1_key(query), answer, ex=self._ttl)

        member = hashlib.sha256(self._normalize(query).encode()).hexdigest()
        l2_key = self._l2 + member
        await self._r.hset(
            l2_key,
            mapping={
                "question": self._normalize(query),
                "answer": answer,
                "embedding": self._to_bytes(query_embedding),
                "doc_ids": json.dumps(doc_ids),
                "created": int(time.time()),
            },
        )
        await self._r.expire(l2_key, self._ttl)
