from motor.motor_asyncio import AsyncIOMotorClient
import os
import certifi
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")
USE_MOCK_DB_ENV = os.getenv("USE_MOCK_DB", "false").lower() == "true"

print(f"DEBUG: MONGODB_URL found: {bool(MONGODB_URL)}")
print(f"DEBUG: USE_MOCK_DB_ENV: {USE_MOCK_DB_ENV}")

# Use mock if explicitly requested OR if no MongoDB URL is provided
USE_MOCK_DB = USE_MOCK_DB_ENV or not MONGODB_URL

class MockCollection:
# ... (rest of MockCollection)

class MockDatabase:
    def __init__(self):
        self.users = MockCollection()
        self.roadmaps = MockCollection()

if USE_MOCK_DB:
    print("DEBUG: Using In-Memory Mock Database")
    db = MockDatabase()
    client = None
else:
    print("DEBUG: Connecting to MongoDB...")
    # Fix for SSL: TLSV1_ALERT_INTERNAL_ERROR
    client = AsyncIOMotorClient(
        MONGODB_URL, 
        serverSelectionTimeoutMS=5000,
        tlsCAFile=certifi.where()
    )
    db = client.career_os

async def get_db():
    return db