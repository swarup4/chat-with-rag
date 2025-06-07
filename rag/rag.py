import os
from dotenv import load_dotenv
from pymongo import MongoClient
from langchain_mongodb import MongoDBAtlasVectorSearch
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_core.prompts import PromptTemplate
from langchain.document_loaders import PyPDFLoader, DirectoryLoader
from langchain_community.embeddings.fastembed import FastEmbedEmbeddings
from langchain_huggingface import ChatHuggingFace, HuggingFaceEndpoint

load_dotenv()
HUGGINGFACEHUB_ACCESS_TOKEN = os.getenv("HUGGINGFACEHUB_ACCESS_TOKEN")
MONGODB_ATLAS_CLUSTER_URI = os.getenv("MONGODB_ATLAS_CLUSTER_URI")

embedding = FastEmbedEmbeddings()

llm = HuggingFaceEndpoint(
    repo_id="HuggingFaceH4/zephyr-7b-beta",
    task="text-generation",
    huggingfacehub_api_token=HUGGINGFACEHUB_ACCESS_TOKEN,
)

loader = DirectoryLoader(
    path='./Trip/Thailand',
    glob='*.pdf',
    loader_cls=PyPDFLoader
)

data = loader.load()
print("Data Count ===>>> ", len(data))
text = "\n\n".join(chunk.page_content for chunk in data)

### Create Text convert into Chunks
splitter = RecursiveCharacterTextSplitter(
    separators=["\n\n","\n", ". ", " "],
    chunk_size = 500,
    chunk_overlap = 50,
    is_separator_regex=False
)
chunk = splitter.create_documents(texts=[text])

# initialize MongoDB python client
client = MongoClient(MONGODB_ATLAS_CLUSTER_URI)

DB_NAME = "llm"
COLLECTION_NAME = "vector"
ATLAS_VECTOR_SEARCH_INDEX_NAME = "vector-stores-index"
MONGODB_COLLECTION = client[DB_NAME][COLLECTION_NAME]

vector_store = MongoDBAtlasVectorSearch(
    collection=MONGODB_COLLECTION,
    embedding=embedding,
    index_name=ATLAS_VECTOR_SEARCH_INDEX_NAME,
    relevance_score_fn="cosine",
)

vector_store.create_vector_search_index(dimensions=1536)
vector_store.add_documents(chunk)

retriever = vector_store.as_retriever(
    search_type="similarity",
    search_kwargs={"k": 4},
)
query = "Tell me about Foolmoon Party plan"
result = retriever.invoke(query)

# # Print results
# for doc in result:
#     print(doc.page_content)


# Extra Task
def format_doc(result):
    text = "\n\n".join(doc.page_content for doc in result)
    return text


prompt = PromptTemplate(
    template="""
    You are a helpful travel assistant.
    Answer Only from the provided transcript context.
    If the context is insufficient, just say you don't know.

    {context}
    Question: {question}
    """,
    input_variables=['context', 'question']
)


context_text = format_doc(result)
final_prompt = prompt.invoke({"context": context_text, "question": query})

model= ChatHuggingFace(llm=llm)
answer = model.invoke(final_prompt)
print(answer.content)