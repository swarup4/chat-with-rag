# Production-Grade RAG — Implementation Plan & Milestones

Upgrade path for `chat-with-rag` from MVP → production. Ordered by leverage × dependency.
Locked stack: **Azure OpenAI** (LLM) · **Voyage AI** (embeddings + reranker) · **Redis** (cache) ·
**MongoDB Atlas Vector Search** · **LangChain / LangGraph / LangSmith / Ragas** · Docker/K8s.

**Legend:** ✅ done · 🚧 in progress · ⬜ not started

| Milestone | Theme | Status |
|---|---|---|
| M0 | Foundations (stateless tier + observability) | ✅ |
| M1 | Voyage embeddings + blue/green re-index | ⬜ |
| M2 | Two-layer semantic cache (the hard requirement) | ⬜ |
| M3 | Retrieval quality: reranker + hybrid + citation chunking | ⬜ |
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

## M1 — Voyage embeddings + blue/green re-index ⬜

**Goal:** replace Azure `text-embedding-3-large` (1536-d) with Voyage `voyage-context-3`. This is a
**breaking** change — embedding dimension changes, so the vector index must be rebuilt, not mutated.

- [ ] Add `langchain-voyageai` + `VOYAGE_API_KEY` (env + `.env.example`).
- [ ] Swap `self.embedding` in `rag/app/rag_service.py` to Voyage; set new `EMBEDDING_DIMENSIONS`.
- [ ] Create a **new** Atlas vector index (`VECTOR_INDEX_NAME=embedding_vector_index_voyage`) — never
      mutate the live `embeddings` index in place.
- [ ] Re-embed existing corpus into the new collection/index (one-off backfill script).
      *Decision pending: re-embed existing docs vs. start fresh.*
- [ ] Cut over `RAGService` to the new index; keep the old index until validated, then drop.

**Done when:** `/qa` returns answers from the Voyage index with quality ≥ the Azure baseline
(eyeball + LangSmith retrieval scores), and the old index is removed.

---

## M2 — Two-layer semantic cache ⬜ (headline requirement)

**Goal:** similar questions never hit the LLM. Sits in front of `RAGService.answer()`.

- [ ] Stand up Redis (managed; `docker-compose` service for local).
- [ ] **L1 exact cache:** key = hash(normalized query + session/scope), value = answer. Near-zero cost.
- [ ] **L2 semantic cache:** embed query (Voyage), Redis vector KNN, threshold ~0.95 → return stored
      answer on hit, no LLM. Tune threshold against LangSmith near-miss logs.
- [ ] Write-back on miss: `{embedding, answer, doc-tags, scope, TTL}` to both layers.
- [ ] Move session history Redis (replaces the Mongo stopgap from M0).
- [ ] Cache-hit/miss metric surfaced in LangSmith trace metadata.

**Done when:** two semantically-equivalent questions ("how much is X" / "price of X") produce exactly
one LLM call, the second served in <100 ms, and hit ratio is visible on a dashboard.

---

## M3 — Retrieval quality ⬜

**Goal:** make cached answers trustworthy (garbage cached = garbage served fast).

- [ ] **Voyage reranker** (`rerank-2.5`): retrieve top-~50 → rerank to top-6–8 before generation.
- [ ] **Hybrid search** (vector + keyword) in Atlas.
- [ ] **Citation-aware chunking:** preserve section/heading/page metadata so answers cite precisely.
      Extend `Embedding` model (`rag/app/models.py`) with source metadata fields.

**Done when:** answers include source + page citations, and Ragas context-precision/recall improve
measurably over the M1 baseline.

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
