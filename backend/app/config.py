import os
from dotenv import load_dotenv
from pymongo import MongoClient

# Load .env variables
load_dotenv()

# Global MongoDB objects
mongo_client = None
db = None
GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
def init_config(app):
    """Initialize MongoDB connection and attach it globally."""
    global mongo_client, db

    # Read environment variables
    MONGO_URI = os.getenv("MONGO_URI")
    DB_NAME = os.getenv("DB_NAME", "expense_tracker")

    if not MONGO_URI:
        raise Exception("MONGO_URI is missing in .env file!")

    # Connect to MongoDB
    mongo_client = MongoClient(MONGO_URI)
    db = mongo_client[DB_NAME]

    print(f"[MongoDB] Connected to database: {DB_NAME}")
