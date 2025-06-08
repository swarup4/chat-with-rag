import os
from dotenv import load_dotenv
from pymongo import MongoClient
from langchain_mongodb import MongoDBAtlasVectorSearch
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.prompts import PromptTemplate
from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_community.embeddings.fastembed import FastEmbedEmbeddings
from langchain_huggingface import HuggingFaceEndpoint
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationalRetrievalChain

# --- Configuration and Setup ---
def load_config():
    load_dotenv()
    return {
        "HUGGINGFACEHUB_ACCESS_TOKEN": os.getenv("HUGGINGFACEHUB_ACCESS_TOKEN"),
        "MONGODB_ATLAS_CLUSTER_URI": os.getenv("MONGODB_ATLAS_CLUSTER_URI"),
        "DB_NAME": "llm",
        "COLLECTION_NAME": "vector",
        "ATLAS_VECTOR_SEARCH_INDEX_NAME": "vector-stores-index",
        "PDF_PATH": "./Trip/Thailand",
    }

# --- Data Loading and Chunking ---
def load_and_chunk_pdfs(pdf_path):
    loader = PyPDFDirectoryLoader(
        path=pdf_path,
        glob="*.pdf",
    )
    data = loader.load()
    print("Data Count ===>>> ", len(data))
    text = "\n\n".join(chunk.page_content for chunk in data)

    splitter = RecursiveCharacterTextSplitter(
        is_separator_regex=True,
        length_function=len,
        separators=["\n\n", "\n", " ", ""],
        chunk_size=500,
        chunk_overlap=50
    )
    return splitter.create_documents(texts=[text])

# --- Vector Store Setup ---
def setup_vector_store(config, embedding, chunk):
    client = MongoClient(config["MONGODB_ATLAS_CLUSTER_URI"])
    collection = client[config["DB_NAME"]][config["COLLECTION_NAME"]]
    vector_store = MongoDBAtlasVectorSearch(
        collection=collection,
        embedding=embedding,
        index_name=config["ATLAS_VECTOR_SEARCH_INDEX_NAME"],
        relevance_score_fn="cosine",
    )
    vector_store.create_vector_search_index(dimensions=384)
    vector_store.add_documents(chunk)
    return vector_store

# --- Conversation Chain Setup ---
def setup_conversation_chain(llm, retriever):
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
    return ConversationalRetrievalChain.from_llm(
        llm=llm,
        retriever=retriever,
        memory=memory,
        combine_docs_chain_kwargs={'prompt': prompt},
        return_source_documents=True,
        verbose=True,
        rephrase_question=True,
    )

# --- Main Chat Loop ---
def chat_loop(conversation_chain):
    print("\nWelcome to the Travel Assistant! Type 'exit' to quit.\n")
    while True:
        user_input = input("User: ")
        if user_input.lower() in ["exit", "quit"]:
            print("Goodbye!")
            break
        result = conversation_chain({"question": user_input})
        print("Assistant:", result["answer"])

# --- Main Execution ---
if __name__ == "__main__":
    config = load_config()
    embedding = FastEmbedEmbeddings()
    
    llm = HuggingFaceEndpoint(
        repo_id="HuggingFaceH4/zephyr-7b-beta",
        task="text-generation",
        huggingfacehub_api_token=config["HUGGINGFACEHUB_ACCESS_TOKEN"],
    )
    
    chunk = load_and_chunk_pdfs(config["PDF_PATH"])
    vector_store = setup_vector_store(config, embedding, chunk)
    
    retriever = vector_store.as_retriever(
        search_type="similarity",
        search_kwargs={"k": 4},
    )
    conversation_chain = setup_conversation_chain(llm, retriever)
    chat_loop(conversation_chain)