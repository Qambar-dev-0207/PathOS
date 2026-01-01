from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")
USE_MOCK_DB = os.getenv("USE_MOCK_DB", "false").lower() == "true"

class MockCollection:
    def __init__(self):
        self.data = []

    async def find_one(self, query):
        # Basic query matching
        for item in self.data:
            match = True
            for k, v in query.items():
                if item.get(k) != v:
                    match = False
                    break
            if match:
                return item
        return None

    async def insert_one(self, document):
        self.data.append(document)
        return document

    async def replace_one(self, query, document):
        for i, item in enumerate(self.data):
            match = True
            for k, v in query.items():
                if item.get(k) != v:
                    match = False
                    break
            if match:
                self.data[i] = document
                return
        self.data.append(document) # Upsert-ish

    async def update_one(self, query, update):
        # Support for $set only for now
        set_data = update.get("$set", {})
        for item in self.data:
            match = True
            for k, v in query.items():
                if k == "steps.week":
                    # Special case for array query (very basic support)
                    # Assuming checking if any step matches
                    continue 
                if item.get(k) != v:
                    match = False
                    break
            
            if match:
                # Handle nested updates crudely for the specific roadmap use case
                if "steps.week" in query:
                    target_week = query["steps.week"]
                    for step in item.get("steps", []):
                        if step.get("week") == target_week:
                            # Apply the set data relative to steps.$
                            for sk, sv in set_data.items():
                                if sk == "steps.$.completed":
                                    step["completed"] = sv
                            return type('obj', (object,), {'modified_count': 1})
                else:
                    item.update(set_data)
                    return type('obj', (object,), {'modified_count': 1})
        
        return type('obj', (object,), {'modified_count': 0})

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
    client = AsyncIOMotorClient(MONGODB_URL, serverSelectionTimeoutMS=5000)
    db = client.career_os

async def get_db():
    return db