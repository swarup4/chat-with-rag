import asyncio
import os

from langchain_classic.chains import create_history_aware_retriever, create_retrieval_chain
from langchain_classic.chains.combine_documents import create_stuff_documents_chain
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_mongodb import MongoDBAtlasVectorSearch, MongoDBChatMessageHistory
from langchain_openai import AzureChatOpenAI
from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.cache import SemanticCache
from app.db import DB_NAME, embeddings_collection, sync_client
from app.embeddings import VoyageContextualEmbeddings
from app.models import Embedding, IngestedDocument
from app.utils import load_pdf, save_temp_pdf


class RAGService:
    VECTOR_INDEX_NAME = os.getenv("VECTOR_INDEX_NAME", "vector-stores-index")
    EMBEDDING_DIMENSIONS = int(os.getenv("EMBEDDING_DIMENSIONS", "1024"))
    CHAT_HISTORY_COLLECTION = os.getenv("CHAT_HISTORY_COLLECTION", "chat_history")
    VOYAGE_EMBEDDING_MODEL = os.getenv("VOYAGE_EMBEDDING_MODEL", "voyage-context-3")
    CACHE_THRESHOLD = float(os.getenv("CACHE_SIMILARITY_THRESHOLD", "0.95"))
    CACHE_TTL_SECONDS = int(os.getenv("CACHE_TTL_SECONDS", "86400"))

    CONTEXTUALIZE_SYSTEM = (
        "Given the chat history and the latest user question, rephrase the "
        "question into a standalone question. Do NOT answer it — only reformulate "
        "it if needed; otherwise return it as-is."
    )
    ANSWER_SYSTEM = (
        "You are a helpful travel assistant. Answer only from the provided "
        "context. If the context is insufficient, just say you don't know.\n\n"
        "Context:\n{context}"
    )

    SPLITTER = RecursiveCharacterTextSplitter(
        is_separator_regex=False,
        length_function=len,
        separators=["\n\n", "\n", " ", ""],
        chunk_size=500,
        chunk_overlap=50,
    )

    def __init__(self) -> None:
        self.embedding = VoyageContextualEmbeddings(
            model=self.VOYAGE_EMBEDDING_MODEL,
            output_dimension=self.EMBEDDING_DIMENSIONS,
        )
        self.llm = AzureChatOpenAI(
            azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
            api_key=os.getenv("AZURE_OPENAI_API_KEY"),
            api_version=os.getenv("AZURE_OPENAI_API_VERSION"),
            azure_deployment=os.getenv("AZURE_OPENAI_CHAT_DEPLOYMENT_NAME"),
        )
        self.vector_store = MongoDBAtlasVectorSearch(
            collection=embeddings_collection,
            embedding=self.embedding,
            index_name=self.VECTOR_INDEX_NAME,
            relevance_score_fn="cosine",
        )

        redis_url = os.getenv("REDIS_URI", "")
        self._cache: SemanticCache | None = (
            SemanticCache(
                redis_url,
                dim=self.EMBEDDING_DIMENSIONS,
                threshold=self.CACHE_THRESHOLD,
                ttl=self.CACHE_TTL_SECONDS,
            )
            if redis_url.startswith(("redis://", "rediss://"))
            else None
        )

        self._histories: dict[str, MongoDBChatMessageHistory] = {}
        self._chain = self._build_chain()


    async def init_vector_store(self) -> None:
        await asyncio.to_thread(
            self.vector_store.create_vector_search_index,
            dimensions=self.EMBEDDING_DIMENSIONS,
        )

    def _get_session_history(self, session_id: str) -> BaseChatMessageHistory:
        history = self._histories.get(session_id)
        if history is None:
            history = MongoDBChatMessageHistory(
                connection_string=None,
                session_id=session_id,
                database_name=DB_NAME,
                collection_name=self.CHAT_HISTORY_COLLECTION,
                client=sync_client,
            )
            self._histories[session_id] = history
        return history

    def _build_chain(self) -> RunnableWithMessageHistory:
        retriever = self.vector_store.as_retriever(
            search_type="similarity",
            search_kwargs={"k": 4},
        )
        contextualize_prompt = ChatPromptTemplate.from_messages([
            ("system", self.CONTEXTUALIZE_SYSTEM),
            MessagesPlaceholder("chat_history"),
            ("human", "{input}"),
        ])
        answer_prompt = ChatPromptTemplate.from_messages([
            ("system", self.ANSWER_SYSTEM),
            MessagesPlaceholder("chat_history"),
            ("human", "{input}"),
        ])
        rag_chain = create_retrieval_chain(
            create_history_aware_retriever(self.llm, retriever, contextualize_prompt),
            create_stuff_documents_chain(self.llm, answer_prompt),
        )
        return RunnableWithMessageHistory(
            rag_chain,
            self._get_session_history,
            input_messages_key="input",
            history_messages_key="chat_history",
            output_messages_key="answer",
        )


    async def ingest(self, filename: str, contents: bytes) -> str:
        chunks = await asyncio.to_thread(self._load_and_chunk, contents)
        if not chunks:
            return ""

        doc = await IngestedDocument(name=filename).insert()

        texts = [c.page_content for c in chunks]
        vectors = await self.embedding.aembed_documents(texts)
        await Embedding.insert_many([
            Embedding(text=text, embedding=vec, documentId=doc.id)
            for text, vec in zip(texts, vectors)
        ])
        return str(doc.id)

    def _load_and_chunk(self, contents: bytes) -> list:
        return self.SPLITTER.split_documents(load_pdf(save_temp_pdf(contents)))
    

    async def answer(self, question: str, session_id: str) -> tuple[str, str | None]:
        query_embedding: list[float] | None = None
        if self._cache is not None:
            query_embedding = await self.embedding.aembed_query(question)
            hit = await self._cache.get(question, query_embedding)
            if hit is not None:
                answer, cache_type = hit
                return answer, cache_type

        result = await self._chain.ainvoke(
            {"input": question},
            config={"configurable": {"session_id": session_id}},
        )
        answer = result["answer"]

        if self._cache is not None and query_embedding is not None:
            doc_ids = [
                str(d.metadata.get("documentId"))
                for d in result.get("context", [])
                if d.metadata.get("documentId") is not None
            ]
            await self._cache.set(question, answer, query_embedding, doc_ids)

        return answer, None
