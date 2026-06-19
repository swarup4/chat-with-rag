"""Show what's currently stored in the Redis semantic cache.

Run from rag/:  python -m scripts.inspect_cache
"""

from __future__ import annotations

import asyncio
import json
import os

import redis.asyncio as redis
from dotenv import load_dotenv


def _dec(v: object) -> str:
    return v.decode() if isinstance(v, bytes) else str(v)


async def main() -> None:
    load_dotenv()
    url = os.getenv("REDIS_URI", "")
    if not url.startswith(("redis://", "rediss://")):
        print("REDIS_URI not set — cache disabled.")
        return

    r = redis.from_url(url, decode_responses=False)

    try:
        info = await r.ft("qa_cache_idx").info()
        idx = {k.decode() if isinstance(k, bytes) else k: v for k, v in zip(info[::2], info[1::2])} if isinstance(info, list) else info
        print(f"Index 'qa_cache_idx' num_docs: {idx.get('num_docs', idx.get(b'num_docs', '?'))}\n")
    except Exception as e:
        print(f"(no search index yet: {e})\n")

    l1 = [k async for k in r.scan_iter(match="qa:l1:*")]
    l2 = [k async for k in r.scan_iter(match="qa:l2:*")]
    print(f"L1 exact entries: {len(l1)}   L2 semantic entries: {len(l2)}\n")

    print("=== L2 cached Q&A ===")
    for key in l2:
        h = await r.hgetall(key)
        h = {_dec(k): v for k, v in h.items()}
        ttl = await r.ttl(key)
        print(f"- key={_dec(key)}  ttl={ttl}s")
        print(f"    question : {_dec(h.get('question',''))}")
        print(f"    answer   : {_dec(h.get('answer',''))[:90]}")
        print(f"    doc_ids  : {_dec(h.get('doc_ids','[]'))}")
        print(f"    emb_bytes: {len(h.get('embedding', b''))} (1024 floats x 4 = 4096)")


if __name__ == "__main__":
    asyncio.run(main())
