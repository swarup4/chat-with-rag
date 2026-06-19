import os

from beanie import init_beanie
from dotenv import load_dotenv
from pymongo import AsyncMongoClient, MongoClient

from app.models import Embedding, IngestedDocument


load_dotenv()
MONGODB_ATLAS_CLUSTER_URI = os.getenv("MONGODB_ATLAS_CLUSTER_URI")
DB_NAME = os.getenv("MONGODB_DB_NAME", "trip")

# Sync client — used by langchain's MongoDBAtlasVectorSearch for retrieval
sync_client = MongoClient(MONGODB_ATLAS_CLUSTER_URI)
embeddings_collection = sync_client[DB_NAME]["embeddings"]

# Async client — used by Beanie for inserts
async_client = AsyncMongoClient(MONGODB_ATLAS_CLUSTER_URI)
async_db = async_client[DB_NAME]


async def init_db() -> None:
    await init_beanie(database=async_db, document_models=[Embedding, IngestedDocument])
