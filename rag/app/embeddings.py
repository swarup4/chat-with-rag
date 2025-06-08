from langchain_community.embeddings.fastembed import FastEmbedEmbeddings

class EmbeddingModel:
    def __init__(self):
        self.model = FastEmbedEmbeddings()

    def embed_texts(self, texts):
        return self.model.embed_documents(texts) 