import os
from typing import List, Optional
from dotenv import load_dotenv
from pymongo import MongoClient
from langchain_community.embeddings.fastembed import FastEmbedEmbeddings
from langchain_mongodb import MongoDBAtlasVectorSearch
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEndpoint
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationalRetrievalChain
from langchain_core.prompts import PromptTemplate
from app.db import documents_collection, embeddings_collection
from app.embeddings import EmbeddingModel
from app.utils import load_pdf, save_temp_pdf

class RAGService:
    def __init__(self):
        load_dotenv()
        self.embedding = EmbeddingModel()
        self.llm_repo_id = "HuggingFaceH4/zephyr-7b-beta"
        self.vector_index_name = "vector-stores-index"
        self.db_name = "llm"
        self.collection_name = "vector"
        self.mongo_uri = os.getenv("MONGODB_ATLAS_CLUSTER_URI")
        self.hf_token = os.getenv("HUGGINGFACEHUB_ACCESS_TOKEN")
        self.vector_store = None
        self._init_vector_store()

    def _init_vector_store(self):
        
        client = MongoClient(self.mongo_uri)
        collection = client[self.db_name][self.collection_name]
        self.vector_store = MongoDBAtlasVectorSearch(
            collection=collection,
            embedding=FastEmbedEmbeddings(),
            index_name=self.vector_index_name,
            relevance_score_fn="cosine",
        )
        self.vector_store.create_vector_search_index(dimensions=384)
        

    def ingest_document(self, file):
        path = save_temp_pdf(file)
        docs = load_pdf(path)
        text = "\n\n".join(chunk.page_content for chunk in docs)

        text_splitter = RecursiveCharacterTextSplitter(
            is_separator_regex=True,
            length_function=len,
            separators=["\n\n", "\n", " ", ""],
            chunk_size=500,
            chunk_overlap=50
        )
        chunks = text_splitter.create_documents(texts=[text])
        
        texts = [c.page_content for c in chunks]
        vectors = self.embedding.embed_texts(texts)
        doc = documents_collection.insert_one({"name": file.filename})
        doc_id = str(doc.inserted_id)
        print("Doc ID ===>>> ", doc_id)

        for text, vector in zip(texts, vectors):
            embeddings_collection.insert_one({
                "document_id": doc_id,
                "chunk": text,
                "embedding": vector
            })

        # self.vector_store.add_documents(chunks)
        return doc_id

    # def get_documents(self):
    #     docs = []
    #     for doc in documents_collection.find({}):
    #         docs.append({"id": str(doc["_id"]), "name": doc["name"]})
    #     return docs

    def get_chain(self):
        memory = ConversationBufferMemory(
            memory_key="chat_history",
            output_key="answer",
            return_messages=True
        )

        prompt = PromptTemplate(
            template="""
            You are a helpful travel assistant.
            Here is the previous conversation:
            {chat_history}

            Answer only from the provided transcript context.
            If the context is insufficient, just say you don't know.

            {context}
            Question: {question}
            """,
            input_variables=['chat_history', 'context', 'question']
        )
        llm = HuggingFaceEndpoint(
            repo_id=self.llm_repo_id,
            task="text-generation",
            huggingfacehub_api_token=self.hf_token,
        )
        retriever = self.vector_store.as_retriever(
            search_type="similarity",
            search_kwargs={"k": 4},
        )
        return ConversationalRetrievalChain.from_llm(
            llm=llm,
            retriever=retriever,
            memory=memory,
            combine_docs_chain_kwargs={'prompt': prompt},
            return_source_documents=True,
            verbose=True,
            rephrase_question=True,
        )

    def answer_question(self, question: str):
        chain = self.get_chain()
        result = chain({"question": question})
        return result["answer"] 