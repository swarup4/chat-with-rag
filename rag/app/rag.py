import os
from bson import ObjectId
from dotenv import load_dotenv
from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.db import documents_collection, embeddings_collection
from app.embeddings import embed_texts
from app.utils import load_pdf, save_temp_pdf

load_dotenv()


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


def retrieve_chunks(question, document_ids=None, k=4):
    q_emb = embed_texts([question])[0]
    query = {}
    if document_ids:
        query["document_id"] = {"$in": document_ids}
    docs = list(embeddings_collection.find(query))
    import numpy as np
    def cosine(a, b):
        a, b = np.array(a), np.array(b)
        return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))
    scored = [
        (cosine(q_emb, c["embedding"]), c)
        for c in docs
    ]
    scored.sort(reverse=True, key=lambda x: x[0])
    return [c["chunk"] for _, c in scored[:k]]


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