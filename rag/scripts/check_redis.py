"""Verify REDIS_URI connectivity and that the Search/vector module is usable.

Run from rag/:  python -m scripts.check_redis
"""

from __future__ import annotations

import asyncio
import os

import redis.asyncio as redis
from dotenv import load_dotenv
from redis.commands.search.field import VectorField
from redis.commands.search.index_definition import IndexDefinition, IndexType


async def main() -> None:
    load_dotenv()
    url = os.getenv("REDIS_URI", "")
    if not url.startswith(("redis://", "rediss://")):
        print("REDIS_URI is not set to a redis:// or rediss:// URL — cache is DISABLED.")
        return

    r = redis.from_url(url, decode_responses=False)

    try:
        await r.ping()
        print("1. PING                : OK (auth + connectivity work)")
    except Exception as e:
        print(f"1. PING                : FAILED -> {e}")
        print("   If this is a TLS error, switch redis:// <-> rediss:// in REDIS_URI.")
        return

    try:
        await r.execute_command("FT._LIST")
        print("2. Search module       : PRESENT (FT.* commands available)")
    except Exception as e:
        print(f"2. Search module       : MISSING -> {e}")
        print("   Your plan has no Search/vector module — L2 semantic cache won't work.")
        return

    probe = "vector_probe_idx"
    try:
        await r.ft(probe).create_index(
            (VectorField("v", "FLAT", {"TYPE": "FLOAT32", "DIM": 4, "DISTANCE_METRIC": "COSINE"}),),
            definition=IndexDefinition(prefix=["__probe__:"], index_type=IndexType.HASH),
        )
        await r.ft(probe).dropindex()
        print("3. Vector index (KNN)  : OK — your Redis fully supports the semantic cache")
    except Exception as e:
        print(f"3. Vector index (KNN)  : FAILED -> {e}")


if __name__ == "__main__":
    asyncio.run(main())
