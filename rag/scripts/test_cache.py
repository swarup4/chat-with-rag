"""Before/after test for the M2 semantic cache.

Run the RAG server first (python -m app.main), then:
    python -m scripts.test_cache

BEFORE (REDIS_URI unset): every row shows cached=False  -> every query hits the LLM.
AFTER  (REDIS_URI set):   rows 2 (exact) and 3 (semantic) show cached=True, no LLM call.
"""

from __future__ import annotations

import json
import time
import urllib.request

URL = "http://127.0.0.1:8080/qa"

STEPS = [
    ("fresh question (miss expected)", "What is included in the Bangkok city tour?", False, None),
    ("exact repeat (L1 hit expected)", "What is included in the Bangkok city tour?", True, "exact"),
    ("reworded (L2 semantic hit expected)", "What does the Bangkok city tour include?", True, "semantic"),
    ("unrelated (miss expected)", "Tell me about Pattaya beaches and nightlife.", False, None),
]


def ask(question: str) -> tuple[dict, float]:
    body = json.dumps({"question": question, "session_id": "cache-test"}).encode()
    req = urllib.request.Request(URL, data=body, headers={"Content-Type": "application/json"})
    t0 = time.perf_counter()
    with urllib.request.urlopen(req, timeout=60) as resp:
        data = json.loads(resp.read())
    return data, (time.perf_counter() - t0) * 1000


def main() -> None:
    print(f"{'step':<38}{'cached':<8}{'type':<10}{'ms':>8}  verdict")
    print("-" * 80)
    all_pass = True
    for label, q, want_cached, want_type in STEPS:
        data, ms = ask(q)
        cached, ctype = data.get("cached", False), data.get("cache_type")
        ok = (cached == want_cached) and (want_type is None or ctype == want_type)
        all_pass &= ok
        print(f"{label:<38}{str(cached):<8}{str(ctype):<10}{ms:>8.0f}  {'PASS' if ok else 'FAIL'}")
    print("-" * 80)
    print("ALL PASS (cache working)" if all_pass else
          "Some rows did not match — if cached=False everywhere, REDIS_URI is unset (before-state). "
          "If only the semantic row failed, lower CACHE_SIMILARITY_THRESHOLD.")


if __name__ == "__main__":
    main()
