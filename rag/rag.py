import os
from dotenv import load_dotenv
from pymongo import MongoClient
from langchain_mongodb import MongoDBAtlasVectorSearch
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_core.chat_history import InMemoryChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_openai import AzureChatOpenAI, AzureOpenAIEmbeddings
from langchain_classic.chains import create_history_aware_retriever, create_retrieval_chain
from langchain_classic.chains.combine_documents import create_stuff_documents_chain


def load_config():
    load_dotenv()
    return {
        "MONGODB_ATLAS_CLUSTER_URI": os.getenv("MONGODB_ATLAS_CLUSTER_URI"),
        "DB_NAME": "llm",
        "COLLECTION_NAME": "vector",
        "ATLAS_VECTOR_SEARCH_INDEX_NAME": "vector-stores-index",
        "PDF_PATH": "./Trip/Thailand",
        "AZURE_OPENAI_ENDPOINT": os.getenv("AZURE_OPENAI_ENDPOINT"),
        "AZURE_OPENAI_API_KEY": os.getenv("AZURE_OPENAI_API_KEY"),
        "AZURE_OPENAI_API_VERSION": os.getenv("AZURE_OPENAI_API_VERSION"),
        "AZURE_OPENAI_CHAT_DEPLOYMENT_NAME": os.getenv("AZURE_OPENAI_CHAT_DEPLOYMENT_NAME"),
        "AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME": os.getenv("AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME"),
        "EMBEDDING_DIMENSIONS": 1536
    }


def load_and_chunk_pdfs(pdf_path):
    loader = PyPDFDirectoryLoader(
        path=pdf_path,
        glob="*.pdf",
    )
    data = loader.load()
    print("Data Count ===>>> ", len(data))

    splitter = RecursiveCharacterTextSplitter(
        is_separator_regex=False,
        length_function=len,
        separators=["\n\n", "\n", " ", ""],
        chunk_size=500,
        chunk_overlap=50
    )
    return splitter.split_documents(data)


def setup_vector_store(config, embedding, chunk):
    client = MongoClient(config["MONGODB_ATLAS_CLUSTER_URI"])
    collection = client[config["DB_NAME"]][config["COLLECTION_NAME"]]
    vector_store = MongoDBAtlasVectorSearch(
        collection=collection,
        embedding=embedding,
        index_name=config["ATLAS_VECTOR_SEARCH_INDEX_NAME"],
        relevance_score_fn="cosine",
    )
    vector_store.create_vector_search_index(dimensions=config["EMBEDDING_DIMENSIONS"])
    vector_store.add_documents(chunk)
    return vector_store, client


_SESSION_STORE = {}

def get_session_history(session_id):
    if session_id not in _SESSION_STORE:
        _SESSION_STORE[session_id] = InMemoryChatMessageHistory()
    return _SESSION_STORE[session_id]


def setup_lcel_chain(llm, retriever):
    contextualize_prompt = ChatPromptTemplate.from_messages([
        ("system",
         "Given the chat history and the latest user question, rephrase the "
         "question into a standalone question. Do NOT answer it — only reformulate "
         "it if needed; otherwise return it as-is."),
        MessagesPlaceholder("chat_history"),
        ("human", "{input}"),
    ])
    history_aware_retriever = create_history_aware_retriever(
        llm, retriever, contextualize_prompt
    )

    answer_prompt = ChatPromptTemplate.from_messages([
        ("system",
         "You are a helpful travel assistant. Answer only from the provided "
         "context. If the context is insufficient, just say you don't know.\n\n"
         "Context:\n{context}"),
        MessagesPlaceholder("chat_history"),
        ("human", "{input}"),
    ])
    qa_chain = create_stuff_documents_chain(llm, answer_prompt)
    rag_chain = create_retrieval_chain(history_aware_retriever, qa_chain)

    return RunnableWithMessageHistory(
        rag_chain,
        get_session_history,
        input_messages_key="input",
        history_messages_key="chat_history",
        output_messages_key="answer",
    )

def chat_loop(chain):
    print("\nWelcome to the Travel Assistant! Type 'exit' to quit.\n")
    session_config = {"configurable": {"session_id": "default"}}
    while True:
        user_input = input("User: ")
        if user_input.lower() in ["exit", "quit"]:
            print("Goodbye!")
            break
        result = chain.invoke({"input": user_input}, config=session_config)
        print("Assistant:", result["answer"])


if __name__ == "__main__":
    config = load_config()

    embedding = AzureOpenAIEmbeddings(
        azure_endpoint=config["AZURE_OPENAI_ENDPOINT"],
        api_key=config["AZURE_OPENAI_API_KEY"],
        api_version=config["AZURE_OPENAI_API_VERSION"],
        azure_deployment=config["AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME"],
    )

    llm = AzureChatOpenAI(
        azure_endpoint=config["AZURE_OPENAI_ENDPOINT"],
        api_key=config["AZURE_OPENAI_API_KEY"],
        api_version=config["AZURE_OPENAI_API_VERSION"],
        azure_deployment=config["AZURE_OPENAI_CHAT_DEPLOYMENT_NAME"],
        temperature=0,
    )

    chunk = load_and_chunk_pdfs(config["PDF_PATH"])
    vector_store, mongo_client = setup_vector_store(config, embedding, chunk)

    try:
        retriever = vector_store.as_retriever(
            search_type="similarity",
            search_kwargs={"k": 4},
        )
        chain = setup_lcel_chain(llm, retriever)
        chat_loop(chain)
    finally:
        mongo_client.close()