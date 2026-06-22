# Production-Grade RAG — Implementation Plan & Milestones

Upgrade path for `chat-with-rag` from MVP → production. Ordered by leverage × dependency.
Locked stack: **Azure OpenAI** (LLM) · **Voyage AI** (embeddings + reranker) · **Redis** (cache) ·
**MongoDB Atlas Vector Search** · **LangChain / LangGraph / LangSmith / Ragas** · Docker/K8s.

**Legend:** ✅ done · 🚧 in progress · ⬜ not started

| Milestone | Theme | Status |
|---|---|---|
| M0 | Foundations (stateless tier + observability) | ✅ |
| M1 | Voyage embeddings | ✅ |
| M2 | Two-layer semantic cache (the hard requirement) | ✅ |
| M3 | Retrieval quality: reranker + hybrid + PDF fix | ✅ |
| M4 | LangGraph orchestration + streaming | ⬜ |
| M5 | Decoupled ingestion + cache invalidation | ⬜ |
| M6 | Evaluation (Ragas) + tier scaling | ⬜ |

Dependency chain: **M0 → M1 → M2** is strict (embeddings must be final before the semantic cache
is built, or it gets built twice). M3 can overlap M2. M4 depends on M2+M3. M5 closes M2's
invalidation loop. M6 is continuous from M0 onward.

---

## M0 — Foundations ✅ (completed 2026-06-19)

**Goal:** make the app tier stateless and observable — the prerequisite for every scaling tier.

- [x] Persist session history → `MongoDBChatMessageHistory` (was in-memory `defaultdict`).
      `rag/app/rag_service.py` (`_get_session_history`), reuses shared `sync_client`.
- [x] Wire LangSmith tracing via env (`LANGSMITH_*` in `rag/.env.example`), pin `langsmith`.
- [ ] **Activation (you):** set real `LANGSMITH_API_KEY` in `.env`; `docker compose build rag && up rag`;
      run a `/qa` and confirm trace + persisted `chat_history` collection.

**Done when:** restarting the rag container preserves conversation history, and every `/qa` and
`/ingest` run shows up as a trace in LangSmith.

---

## M1 — Voyage embeddings ✅ (verified working 2026-06-20)

**Goal:** replace Azure `text-embedding-3-large` (1536-d) with Voyage `voyage-context-3` (1024-d).
**Decision (2026-06-20):** no blue/green — fresh start. New database `trip`, the same `embeddings`
collection holds the Voyage vectors, corpus re-ingested via `/ingest`. Old Azure config commented out.

**Note:** `voyage-context-3` is a *contextualized* model — it uses the SDK's `contextualized_embed()`
(all chunks of a document embedded together), not the plain `embed()` LangChain's `VoyageAIEmbeddings`
wraps. So M1 uses the native `voyageai` SDK behind a custom `Embeddings` wrapper, not `langchain-voyageai`.

Code (done):
- [x] Add `voyageai` + `VOYAGE_API_KEY` / `VOYAGE_EMBEDDING_MODEL` (`rag/requirements.txt`, `.env.example`).
- [x] `VoyageContextualEmbeddings` wrapper over `contextualized_embed` — `rag/app/embeddings.py`.
- [x] Swap `self.embedding` in `rag/app/rag_service.py` to Voyage; `EMBEDDING_DIMENSIONS` default → 1024.
- [x] Database name → `trip` (env `MONGODB_DB_NAME`), embeddings collection stays `embeddings` — `db.py`, `models.py`.
- [x] Comment out deprecated Azure embedding config in `.env.example` (chat still uses Azure OpenAI).

Deploy runbook (ops — you):
- [ ] Set `.env`: `VOYAGE_API_KEY`, `EMBEDDING_DIMENSIONS=1024`, `VECTOR_INDEX_NAME=embedding_vector_index`,
      `MONGODB_DB_NAME=trip`. Rebuild rag container (installs `voyageai`).
- [ ] `POST /init` → builds the 1024-d Atlas vector index on `trip.embeddings`.
- [ ] Re-ingest documents via `/ingest`, then validate `/qa`.

**Cross-service (resolved 2026-06-20):** rag and the Node server were on *different* Atlas clusters
(rag=`genai.jxpdenq`, server=`trigent.32bo0b5`). Unified on **genai** (rag's, canonical): `server/.env`
`MONGODB_URI` → genai + `MONGODB_DB_NAME=trip`; rag `.env` `MONGODB_DB_NAME=trip`. ⚠️ The server's
`users`/auth collection lived on the old trigent cluster — it won't exist on genai/trip until migrated
or re-created (users must re-register, or copy the `users` collection over).

**Done when:** `/qa` returns answers from the Voyage `trip.embeddings` index, and the document UI
(server) and rag service agree on the database.

**Known limit:** one `contextualized_embed` request per document; a single doc exceeding Voyage's
per-request token/chunk cap would need sub-batching — fine for the current medium corpus, revisit if hit.

---

## M2 — Two-layer semantic cache ✅ (verified working 2026-06-20)

**Goal:** similar questions never hit the LLM. Sits in front of `RAGService.answer()`.
**Decision:** no multi-tenancy → single shared cache, no per-user scoping. Redis = user's free-tier
managed instance (must have the Search/vector module; Redis Cloud free tier qualifies).

Code (done):
- [x] `SemanticCache` — `rag/app/cache.py`. L1 exact (normalized-query string) + L2 semantic
      (RediSearch FLAT/COSINE KNN over Voyage query embeddings), TTL on both, doc_ids stored for M5.
- [x] Wired into `RAGService.answer()` — cache check before the chain; write-back on miss. Returns
      `(answer, cache_type)`. Auto-disabled when `REDIS_URI` is unset (clean before/after toggle).
- [x] `/qa` response exposes `cached` + `cache_type` ("exact"|"semantic"|null) — `main.py`.
- [x] `redis` + `numpy` deps; `.env.example` REDIS_URI/threshold/TTL (fixed the bad Mongo placeholder).
- [x] Before/after test harness — `rag/scripts/test_cache.py`.

Verified (Redis Cloud free tier, GenAI DB):
- [x] `REDIS_URI` wired; `scripts/check_redis.py` confirmed Search/vector module; L1+L2 hits confirmed
      live via `scripts/inspect_cache.py` (cached Q&A present with embedding + TTL).
- [ ] Tune `CACHE_SIMILARITY_THRESHOLD` later if semantic hits feel too loose/tight (currently 0.95).

Deferred: session history → Redis (still Mongo from M0); doc-tag cache invalidation → M5.

**Done when:** exact repeat + reworded question both return `cached:true` with no new LLM trace in
LangSmith; unrelated question returns `cached:false`. (`scripts/test_cache.py` asserts this.)

---

## M3 — Retrieval quality ✅ (hybrid + rerank verified 2026-06-21)

**Goal:** make cached answers trustworthy (garbage cached = garbage served fast).

Done:
- [x] **Hybrid search** (Atlas BM25 + vector, RRF) — `MongoDBAtlasHybridSearchRetriever` over a new
      `text_search_index` fulltext index on the `text` field. `RETRIEVE_K=20` candidates.
- [x] **Voyage reranker** (`rerank-2.5`) — custom `BaseDocumentCompressor` (`rag/app/rerank.py`) in a
      `ContextualCompressionRetriever`, narrows 20 → `RERANK_TOP_N=6` before generation.
- [x] **PDF-spacing fix** — `PyPDFLoader(extraction_mode="layout")` in `rag/app/utils.py` (was jamming
      words). Applies to NEW ingests; re-ingest existing docs to benefit.
- [x] Idempotent `init_vector_store` (creates vector + fulltext, skips existing).
- [x] Verified: hybrid → 20 candidates → rerank → top 6, relevant chunk surfaced.

Infra note: Atlas free tier caps **3 search indexes**. Dropped the stale `llm.embeddings` vector index
(pre-migration DB) to make room for `text_search_index`. Watch this limit before adding more indexes.

Deferred:
- [ ] **Citation-aware chunking** (section/heading/page metadata in answers) — separate enhancement.
- [ ] Ragas measurement of the improvement → M6.

**Done when:** hybrid + rerank live in the query path (✅). Citations + Ragas tracked separately.

---

## M4 — LangGraph orchestration + streaming ⬜

**Goal:** replace the `langchain-classic` chain with an explicit state graph; stream first token.

- [ ] Rebuild read path as `StateGraph`: `normalize → cache_check → retrieve → rerank → generate →
      cache_write`, with conditional edges short-circuiting on cache hits.
- [ ] Optional "deep mode" branch (multi-step retrieve→reason→re-retrieve) behind an explicit toggle.
- [ ] **Streaming:** `/qa` → `StreamingResponse`/SSE; update `app/src/components/qa/QAInterface.jsx`
      to render tokens as they arrive.

**Done when:** perceived latency = time-to-first-token (streaming visible in UI), and the graph is
traced node-by-node in LangSmith.

---

## M5 — Decoupled ingestion + invalidation ⬜

**Goal:** heavy re-indexing never degrades live query latency; document changes evict stale cache.

- [ ] Move chunk→embed→upsert out of the `/ingest` request into a queue + worker
      (Azure Service Bus / Container Apps Job locally a worker process).
- [ ] **Idempotent upserts** keyed `documentId + chunk_index + content_hash`; versioning + tombstoning.
      Extend `Embedding` model with `doc_version` + `content_hash`.
- [ ] Publish `docs-changed` event → evict dependent L1/L2 cache entries by doc-tag (closes M2's loop).

**Done when:** uploading a 100-page PDF doesn't spike `/qa` latency, re-running a batch creates zero
duplicate vectors, and updating a doc evicts every cache entry built from it.

---

## M6 — Evaluation + tier scaling ⬜ (continuous)

**Goal:** regression-gate quality; scale infra only as load demands.

- [ ] **Ragas** in CI: faithfulness, context precision/recall, answer relevancy on a fixed eval set.
      Every prompt/chunk/model change must pass before merge.
- [ ] Dashboards: cache hit ratio · p95 latency · token spend · Atlas vector query p95 · reranker latency.
- [ ] **Tier scaling** (you're at Tier 1): Container Apps + managed Redis + Atlas M10/M20 → ~100K users;
      AKS + sharding + PTUs only at Tier 3 (1M). Don't adopt K8s early.

**Done when:** no quality regression ships unnoticed, and scaling decisions are driven by the
capacity dashboard, not guesswork.

---

## Open decisions to resolve

1. **M1 backfill:** re-embed existing corpus into the Voyage index, or start fresh?
2. **M2 multi-tenancy:** do different users see different docs? (Determines cache key scoping — whether
   a hit can be shared across users.)
3. **Citations strictness** (M3): always require source + page?
4. **Conversation scope:** single-shot Q&A or multi-turn (affects cache keying + graph state)?
