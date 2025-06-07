from langchain_community.embeddings.fastembed import FastEmbedEmbeddings

embedding_model = FastEmbedEmbeddings()

def embed_texts(texts):
    return embedding_model.embed_documents(texts)