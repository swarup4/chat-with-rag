import os
from bson import ObjectId
from dotenv import load_dotenv
from pymongo import MongoClient
from langchain_community.embeddings.fastembed import FastEmbedEmbeddings
from langchain_mongodb import MongoDBAtlasVectorSearch
from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.db import documents_collection, embeddings_collection
from app.embeddings import embed_texts
from app.utils import load_pdf, save_temp_pdf

load_dotenv()

mongo_uri = os.getenv("MONGODB_ATLAS_CLUSTER_URI")
embedding = FastEmbedEmbeddings()
# self.llm = self.load_llm()
client = MongoClient(mongo_uri)
db_name = "llm"
collection_name = "vector"
index_name = "vector-stores-index"
# self.text_splitter = self.init_text_splitter()

def setup_vector_store(documents):
    collection = client[db_name][collection_name]
    vector_store = MongoDBAtlasVectorSearch(
        collection=collection,
        embedding=embedding,
        index_name=index_name,
        relevance_score_fn="cosine",
    )
    vector_store.create_vector_search_index(dimensions=1536)
    vector_store.add_documents(documents)
    return vector_store
    

def ingest_document(file):
    path = save_temp_pdf(file)
    docs = load_pdf(path)
    text_splitter = RecursiveCharacterTextSplitter(
        is_separator_regex=True, 
        length_function=len, 
        separators=["\n\n", "\n", " ", ""],
        chunk_size=500, 
        chunk_overlap=50
    )
    chunks = text_splitter.create_documents([d.page_content for d in docs])
    texts = [c.page_content for c in chunks]
    vectors = embed_texts(texts)
    doc = documents_collection.insert_one({"name": file.filename})
    doc_id = str(doc.inserted_id)
    for text, vector in zip(texts, vectors):
        embeddings_collection.insert_one({
            "document_id": doc_id,
            "chunk": text,
            "embedding": vector
        })
    return doc_id


def get_documents():
    docs = []
    for doc in documents_collection.find({}):
        docs.append({"id": str(doc["_id"]), "name": doc["name"]})
    return docs


# def retrieve_chunks(question, document_ids=None, k=4):
#     q_emb = embed_texts([question])[0]
#     query = {}
#     if document_ids:
#         query["document_id"] = {"$in": document_ids}
#     docs = list(embeddings_collection.find(query))
#     import numpy as np
#     def cosine(a, b):
#         a, b = np.array(a), np.array(b)
#         return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))
#     scored = [
#         (cosine(q_emb, c["embedding"]), c)
#         for c in docs
#     ]
#     scored.sort(reverse=True, key=lambda x: x[0])
#     return [c["chunk"] for _, c in scored[:k]]

def retrieve_context(question, document_ids=None, k=4):
    vector_store = setup_vector_store(documents)
    retriever = vector_store.as_retriever(
        search_type="similarity",
        search_kwargs={"k": k},
    )
    return retriever.invoke(query)

def answer_question(question, document_ids=None):
    chunks = retrieve_chunks(question, document_ids)
    context = "\n\n".join(chunks)
    prompt = f"""
    You are a helpful travel assistant.
    Answer only from the provided context.
    If the context is insufficient, just say you don't know.

    Context:
    {context}

    Question: {question}
    """
    from langchain_huggingface import ChatHuggingFace, HuggingFaceEndpoint
    llm = HuggingFaceEndpoint(
        repo_id="HuggingFaceH4/zephyr-7b-beta",
        task="text-generation",
        huggingfacehub_api_token=os.getenv("HUGGINGFACEHUB_ACCESS_TOKEN"),
    )
    model = ChatHuggingFace(llm=llm)
    answer = model.invoke(prompt)
    return answer.content.strip()