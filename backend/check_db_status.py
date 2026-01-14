import asyncio
from database import db
from dotenv import load_dotenv
import os

async def check_db():
    load_dotenv(override=True)
    try:
        count = await db.users.count_documents({})
        print(f"Users in DB: {count}")
        
        roadmaps = await db.roadmaps.count_documents({})
        print(f"Roadmaps in DB: {roadmaps}")
        
        async for u in db.users.find():
            print(f"User: {u.get('email')}, ID: {u.get('_id')}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(check_db())
