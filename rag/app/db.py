import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()
MONGODB_ATLAS_CLUSTER_URI = os.getenv("MONGODB_ATLAS_CLUSTER_URI")

client = MongoClient(MONGODB_ATLAS_CLUSTER_URI)
db = client["llm"]
documents_collection = db["documents"]
embeddings_collection = db["vectors"] 