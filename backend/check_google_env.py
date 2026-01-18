from dotenv import load_dotenv
import os

load_dotenv()

client_id = os.getenv("GOOGLE_CLIENT_ID")
client_secret = os.getenv("GOOGLE_CLIENT_SECRET")

print(f"GOOGLE_CLIENT_ID is {'SET' if client_id else 'MISSING'}")
print(f"GOOGLE_CLIENT_SECRET is {'SET' if client_secret else 'MISSING'}")
