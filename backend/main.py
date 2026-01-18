from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from fastapi_sso.sso.google import GoogleSSO
from pydantic import BaseModel
from typing import List, Optional
import os
import json
import re
import secrets
from datetime import datetime, timedelta
from bson import ObjectId

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import EmailStr, Field
from jose import JWTError, jwt
from passlib.context import CryptContext
from openai import OpenAI
from dotenv import load_dotenv
from duckduckgo_search import DDGS

from database import db
from models_db import UserCreate, UserLogin, Token, TokenData, UserModel

# Load environment variables
load_dotenv(override=True)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8002", "https://path-os.netlify.app"], # Specific origins for credentials
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Configuration ---
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
SECRET_KEY = os.getenv("SECRET_KEY", "fallback_secret_key_for_dev_only")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

# --- Google Auth Config ---
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
# Ensure redirect_uri matches what is registered in Google Cloud Console
# For local dev, typically http://localhost:8002/auth/google/callback
google_sso = None
if GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET:
    google_sso = GoogleSSO(
        client_id=GOOGLE_CLIENT_ID,
        client_secret=GOOGLE_CLIENT_SECRET,
        redirect_uri="http://localhost:8002/auth/google/callback",
        allow_insecure_http=True
    )

# Initialize OpenAI Client for OpenRouter
client = None
if OPENROUTER_API_KEY:
    client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=OPENROUTER_API_KEY,
    )

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# --- Schemas ---
class UserProfile(BaseModel):
    target_role: str
    salary_range: str
    timeline: str
    current_skills: List[str]
    hours_per_week: int

class Resource(BaseModel):
    title: str
    url: Optional[str] = ""

class RoadmapStep(BaseModel):
    week: int
    title: str
    description: str
    resources: List[Resource]
    completed: bool = False

class Roadmap(BaseModel):
    user_email: Optional[str] = None
    role: str
    steps: List[RoadmapStep]

# --- Auth Helpers ---
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            log_debug("Token decode failed: No sub/email found")
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError as e:
        log_debug(f"JWT Decode Error: {e}")
        raise credentials_exception
    
    user = None
    try:
        # DB Lookup with explicit safeguard
        from database import USE_MOCK_DB
        if not USE_MOCK_DB:
            try:
                # Use a simpler find_one which respects the client timeout configured in database.py
                user = await db.users.find_one({"email": token_data.email})
            except Exception as db_e:
                log_debug(f"DB Lookup Failed: {db_e}. Checking Mock...")
    except Exception as e:
        log_debug(f"Outer DB Block Error: {e}")
        pass
        
    if user is None:
        # Check mock
        user = next((u for u in MOCK_USERS if u["email"] == token_data.email), None)
        
    if user is None:
        log_debug(f"User {token_data.email} not found in DB or Mock.")
        raise credentials_exception
    return user

# --- Routes ---

@app.get("/")
def read_root():
    return {"message": "AI Career Roadmap Generator API"}

@app.get("/health")
async def health_check():
    from database import USE_MOCK_DB, MONGODB_URL
    db_type = "Mock" if USE_MOCK_DB else "MongoDB"
    masked_url = MONGODB_URL[:15] + "..." if MONGODB_URL else "None"
    
    db_status = "Connected"
    if not USE_MOCK_DB:
        try:
            # Check if we can reach the DB
            await db.command("ping")
        except Exception as e:
            db_status = f"Error: {str(e)}"

    return {
        "status": "online",
        "database": db_type,
        "database_url": masked_url,
        "database_status": db_status,
        "openrouter_key_set": bool(OPENROUTER_API_KEY)
    }

# ... imports

# --- Mock Storage (Fallback) ---
# Pre-seed a user for easy testing
default_pwd_hash = pwd_context.hash("password")
MOCK_USERS = [
    {
        "_id": "demo",
        "name": "Demo Operator",
        "email": "demo@pathos.dev",
        "hashed_password": default_pwd_hash,
        "friends": [],
        "friend_requests_sent": [],
        "friend_requests_received": []
    }
]
MOCK_ROADMAPS = {}

def log_debug(msg):
    # Always print to stdout for Render logs
    print(f"[{datetime.utcnow()}] {msg}")
    try:
        with open("debug_auth.log", "a") as f:
            f.write(f"[{datetime.utcnow()}] {msg}\n")
    except:
        pass

# ... (rest of configuration)

@app.post("/register", response_model=Token)
async def register(user: UserCreate):
    log_debug(f"REGISTER ATTEMPT: {user.email}")
    hashed_password = get_password_hash(user.password)
    new_user = {
        "name": user.name,
        "email": user.email,
        "hashed_password": hashed_password
    }
    
    try:
        # Try MongoDB/MockDB
        existing_user = await db.users.find_one({"email": user.email})
        if existing_user:
            log_debug("Email already registered (DB)")
            raise HTTPException(status_code=400, detail="Email already registered")
        
        await db.users.insert_one(new_user)
        log_debug("User created successfully in DB")
    except HTTPException as he:
        raise he
    except Exception as e:
        log_debug(f"WARNING: DB insert failed ({e}). Checking Mock List.")
        # Mock Fallback (Redundant if db IS MockDatabase, but keeping for safety)
        if any(u['email'] == user.email for u in MOCK_USERS):
             raise HTTPException(status_code=400, detail="Email already registered (Mock)")
        MOCK_USERS.append(new_user)
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/login", response_model=Token)
async def login(user: UserLogin):
    log_debug(f"LOGIN ATTEMPT: {user.email}")
    db_user = None
    try:
        db_user = await db.users.find_one({"email": user.email})
    except Exception as e:
         log_debug(f"DB Find failed: {e}")

    # Fallback to MOCK_USERS list if DB returned nothing (or failed)
    if not db_user:
        log_debug("User not found in DB, checking MOCK_USERS list...")
        db_user = next((u for u in MOCK_USERS if u["email"] == user.email), None)

    if not db_user:
        log_debug("User not found anywhere.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not verify_password(user.password, db_user["hashed_password"]):
        log_debug("Password verification failed")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    log_debug("Login successful. Generating token.")
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}

# --- Google Auth Routes ---

@app.get("/auth/google/login")
async def google_login():
    if not google_sso:
        # Graceful error for UI
        raise HTTPException(status_code=500, detail="Google Auth not configured (Check Server Logs)")
    return await google_sso.get_login_redirect()

@app.get("/auth/google/callback")
async def google_callback(request: Request):
    if not google_sso:
        raise HTTPException(status_code=500, detail="Google Auth not configured")
        
    try:
        user_info = await google_sso.verify_and_process(request)
        if not user_info or not user_info.email:
             raise HTTPException(status_code=400, detail="Google Auth failed: No email returned")
             
        log_debug(f"Google Auth Success: {user_info.email}")
        
        # Check DB
        existing_user = None
        try:
            existing_user = await db.users.find_one({"email": user_info.email})
        except Exception:
            pass
            
        # Check Mock if not in DB (for consistency with rest of app)
        if not existing_user:
             existing_user = next((u for u in MOCK_USERS if u["email"] == user_info.email), None)

        if not existing_user:
            # Create User
            new_password = secrets.token_urlsafe(16)
            hashed_password = get_password_hash(new_password)
            new_user_doc = {
                "name": user_info.display_name or user_info.email.split('@')[0],
                "email": user_info.email,
                "hashed_password": hashed_password,
                "provider": "google",
                "avatar": user_info.picture,
                "friends": [],
                "friend_requests_sent": [],
                "friend_requests_received": []
            }
            try:
                await db.users.insert_one(new_user_doc)
                log_debug(f"Created new Google user in DB: {user_info.email}")
            except Exception as e:
                log_debug(f"Google Register DB Error: {e}. Using Mock.")
                # Mock Fallback
                MOCK_USERS.append(new_user_doc)

        # Generate Token
        access_token = create_access_token(
            data={"sub": user_info.email},
            expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        
        # Redirect to Frontend
        return RedirectResponse(url=f"http://localhost:3000/auth/callback?token={access_token}")

    except Exception as e:
        log_debug(f"Google Callback Error: {e}")
        # Redirect to login with error
        return RedirectResponse(url=f"http://localhost:3000/login?error=GoogleAuthFailed")

# --- Friend System Routes ---

@app.post("/friends/request/{target_id}")
async def send_friend_request(target_id: str, current_user: dict = Depends(get_current_user)):
    current_id = str(current_user.get("_id", "demo"))
    if target_id == current_id:
        raise HTTPException(status_code=400, detail="Cannot friend yourself")

    # AUTO-ACCEPT FOR DEMO: Immediate connection
    if target_id == "demo":
        # Add to current user's friends
        if "_id" in current_user and isinstance(current_user["_id"], ObjectId):
            await db.users.update_one(
                {"_id": current_user["_id"]}, 
                {
                    "$addToSet": {"friends": "demo"},
                    "$pull": {"friend_requests_sent": "demo"}
                }
            )
        
        # Add to Demo's friends (Mock)
        d_user = next((u for u in MOCK_USERS if u["email"] == "demo@pathos.dev"), None)
        if d_user:
            d_user.setdefault("friends", []).append(current_id)
            if current_id in d_user.get("friend_requests_received", []):
                d_user["friend_requests_received"].remove(current_id)
                
        return {"message": "Friend request accepted automatically (Demo)"}

    # Check if target exists
    target_user = None
    try:
        if ObjectId.is_valid(target_id):
            target_user = await db.users.find_one({"_id": ObjectId(target_id)})
    except: pass
    
    if not target_user:
        # Check Mock
        target_user = next((u for u in MOCK_USERS if str(u.get("_id", "")) == target_id), None)
    
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Logic for MongoDB
    if "_id" in current_user and isinstance(current_user["_id"], ObjectId):
        # Check if already friends or requested
        if target_id in current_user.get("friends", []) or target_id in current_user.get("friend_requests_sent", []):
             return {"message": "Request already sent or already friends"}
             
        # Update Sender
        await db.users.update_one({"_id": current_user["_id"]}, {"$addToSet": {"friend_requests_sent": target_id}})
        
        # Update Target
        if ObjectId.is_valid(target_id):
            await db.users.update_one({"_id": ObjectId(target_id)}, {"$addToSet": {"friend_requests_received": current_id}})
        else:
            # Handle Mock Target (update in memory for 'demo' user)
            t_user = next((u for u in MOCK_USERS if str(u.get("_id", "")) == target_id), None)
            if t_user:
                t_user.setdefault("friend_requests_received", []).append(current_id)
    
    else:
        # Mock Logic
        c_user = next((u for u in MOCK_USERS if str(u.get("_id", "")) == current_id), None)
        t_user = next((u for u in MOCK_USERS if str(u.get("_id", "")) == target_id), None)
        
        if c_user and t_user:
            if target_id not in c_user.get("friends", []) and target_id not in c_user.get("friend_requests_sent", []):
                c_user.setdefault("friend_requests_sent", []).append(target_id)
                t_user.setdefault("friend_requests_received", []).append(current_id)

    return {"message": "Friend request sent"}

@app.post("/friends/accept/{requester_id}")
async def accept_friend_request(requester_id: str, current_user: dict = Depends(get_current_user)):
    current_id = str(current_user.get("_id", "demo"))
    
    # MongoDB Logic
    if "_id" in current_user and isinstance(current_user["_id"], ObjectId):
        # Verify request exists
        if requester_id not in current_user.get("friend_requests_received", []):
            raise HTTPException(status_code=400, detail="No request found")

        # Add to friends list (both ways)
        await db.users.update_one({"_id": current_user["_id"]}, {
            "$addToSet": {"friends": requester_id},
            "$pull": {"friend_requests_received": requester_id}
        })
        
        if ObjectId.is_valid(requester_id):
            await db.users.update_one({"_id": ObjectId(requester_id)}, {
                "$addToSet": {"friends": current_id},
                "$pull": {"friend_requests_sent": current_id}
            })
        else:
            # Handle Mock Requester
            r_user = next((u for u in MOCK_USERS if str(u.get("_id", "")) == requester_id), None)
            if r_user:
                r_user.setdefault("friends", []).append(current_id)
                if current_id in r_user.get("friend_requests_sent", []):
                    r_user["friend_requests_sent"].remove(current_id)
    else:
        # Mock Logic
        c_user = next((u for u in MOCK_USERS if str(u.get("_id", "")) == current_id), None)
        r_user = next((u for u in MOCK_USERS if str(u.get("_id", "")) == requester_id), None)
        
        if c_user and r_user:
            if requester_id in c_user.get("friend_requests_received", []):
                c_user.setdefault("friends", []).append(requester_id)
                c_user["friend_requests_received"].remove(requester_id)
                
                r_user.setdefault("friends", []).append(current_id)
                if current_id in r_user.get("friend_requests_sent", []):
                    r_user["friend_requests_sent"].remove(current_id)

    return {"message": "Friend request accepted"}

@app.get("/friends")
async def get_friends(current_user: dict = Depends(get_current_user)):
    # SELF-HEALING: If 'demo' is pending, promote it
    if "demo" in current_user.get("friend_requests_sent", []):
        if "_id" in current_user and isinstance(current_user["_id"], ObjectId):
             await db.users.update_one(
                {"_id": current_user["_id"]}, 
                {
                    "$addToSet": {"friends": "demo"},
                    "$pull": {"friend_requests_sent": "demo"}
                }
             )
             # Refresh current_user object locally for this request
             current_user["friends"].append("demo")
             current_user["friend_requests_sent"].remove("demo")
             
             # Also update Demo side (Mock)
             d_user = next((u for u in MOCK_USERS if u["email"] == "demo@pathos.dev"), None)
             current_id = str(current_user["_id"])
             if d_user:
                 d_user.setdefault("friends", []).append(current_id)

    friend_ids = current_user.get("friends", [])
    friends_data = []

    # MongoDB Fetch
    if "_id" in current_user and isinstance(current_user["_id"], ObjectId):
        if friend_ids:
            # Convert str ids to ObjectId if needed, but they are stored as str usually in mixed list? 
            # In update_one above I used raw string ID. 
            # Standardizing: IDs in lists should be strings to match Pydantic.
            try:
                # If they were stored as strings
                obj_ids = [ObjectId(fid) for fid in friend_ids if ObjectId.is_valid(fid)]
                cursor = db.users.find({"_id": {"$in": obj_ids}})
                async for f in cursor:
                    # Get their stats
                    roadmap = await db.roadmaps.find_one({"user_email": f["email"]})
                    stats = {"percent": 0, "role": "Undecided"}
                    if roadmap:
                        steps = roadmap.get("steps", [])
                        total = len(steps)
                        completed = sum(1 for s in steps if s.get("completed"))
                        stats = {
                            "percent": int((completed/total)*100) if total > 0 else 0,
                            "role": roadmap.get("role", "Undecided")
                        }
                    
                    friends_data.append({
                        "id": str(f["_id"]),
                        "name": f["name"],
                        "stats": stats
                    })
                
                # Manual add for Demo if present
                if "demo" in friend_ids:
                    d_user = next((u for u in MOCK_USERS if u["email"] == "demo@pathos.dev"), None)
                    if d_user:
                        roadmap = MOCK_ROADMAPS.get(d_user["email"])
                        stats = {"percent": 0, "role": "Undecided"}
                        if roadmap:
                            steps = roadmap.get("steps", [])
                            total = len(steps)
                            completed = sum(1 for s in steps if s.get("completed"))
                            stats = {
                                "percent": int((completed/total)*100) if total > 0 else 0,
                                "role": roadmap.get("role", "Undecided")
                            }
                        friends_data.append({
                            "id": "demo",
                            "name": d_user["name"],
                            "stats": stats
                        })

            except Exception as e:
                print(f"Error fetching friends: {e}")
                
    # Mock Fetch
    else:
        for fid in friend_ids:
            f = next((u for u in MOCK_USERS if str(u.get("_id", "")) == fid), None)
            if f:
                roadmap = MOCK_ROADMAPS.get(f["email"])
                stats = {"percent": 0, "role": "Undecided"}
                if roadmap:
                     # Roadmap is dict here
                     steps = roadmap.get("steps", [])
                     total = len(steps)
                     completed = sum(1 for s in steps if s.get("completed"))
                     stats = {
                        "percent": int((completed/total)*100) if total > 0 else 0,
                        "role": roadmap.get("role", "Undecided")
                     }
                friends_data.append({
                    "id": str(f.get("_id", "demo")),
                    "name": f["name"],
                    "stats": stats
                })

    return friends_data

@app.get("/friends/requests")
async def get_friend_requests(current_user: dict = Depends(get_current_user)):
    # Return full objects for received requests so we can show names
    received_ids = current_user.get("friend_requests_received", [])
    sent_ids = current_user.get("friend_requests_sent", [])
    
    received_users = []
    
    # Mongo
    if "_id" in current_user and isinstance(current_user["_id"], ObjectId):
        if received_ids:
            obj_ids = [ObjectId(rid) for rid in received_ids if ObjectId.is_valid(rid)]
            async for u in db.users.find({"_id": {"$in": obj_ids}}):
                received_users.append({"id": str(u["_id"]), "name": u["name"]})
    # Mock
    else:
        for rid in received_ids:
            u = next((u for u in MOCK_USERS if str(u.get("_id", "")) == rid), None)
            if u:
                received_users.append({"id": str(u.get("_id", "")), "name": u["name"]})

    return {
        "received": received_users,
        "sent": sent_ids
    }

@app.post("/generate-roadmap", response_model=Roadmap)
async def generate_roadmap(profile: UserProfile, current_user: dict = Depends(get_current_user)):
    # Force reload env
    load_dotenv(override=True)
    current_key = os.getenv("OPENROUTER_API_KEY")
    
    log_debug(f"Generating roadmap for {profile.target_role}")
    
    # 1. Check if API Key is valid
    if not current_key:
        log_debug("CRITICAL: No valid OPENROUTER_API_KEY found. Falling back to Mock Data.")
        roadmap = generate_mock_roadmap(profile)
    else:
        try:
            # Re-init client to be sure
            or_client = OpenAI(
                base_url="https://openrouter.ai/api/v1",
                api_key=current_key,
                timeout=45.0 # Set explicit timeout
            )

            # Calculate approximate weeks (Base Duration)
            base_weeks = 12 # Default
            timeline_str = profile.timeline.lower().replace(" ", "")
            if "month" in timeline_str:
                try:
                    months = int(re.search(r'(\d+)', timeline_str).group(1))
                    base_weeks = months * 4
                except: pass
            elif "week" in timeline_str:
                try:
                    base_weeks = int(re.search(r'(\d+)', timeline_str).group(1))
                except: pass
            
            # --- TRAJECTORY CALIBRATION ---
            # "True Trajectory" Logic:
            # We assume a standard "High Performance" pace is ~18 hours/week.
            # If a user has less bandwidth, they need MORE time.
            
            STANDARD_PACING_HOURS = 18.0
            
            # 1. Clamp user input to realistic bounds (5h to 60h)
            user_hours = max(5, min(profile.hours_per_week, 60))
            
            # 2. Calculate Velocity Factor (e.g., 9h/week = 0.5x velocity)
            velocity_factor = user_hours / STANDARD_PACING_HOURS
            
            # 3. Adjust Weeks (Inverse: Lower velocity = Higher duration)
            calibrated_weeks = int(base_weeks / velocity_factor)
            
            # 4. Safety Clamps (Min 4 weeks, Max 52 weeks to prevent context overflow)
            duration_weeks = max(4, min(calibrated_weeks, 52))
            
            log_debug(f"TRAJECTORY CALIBRATION: Input {base_weeks}w @ {user_hours}h/wk (v={velocity_factor:.2f}) -> Adjusted to {duration_weeks} weeks.")
            
            system_prompt = "You are an expert technical career coach. You output STRICT JSON only."
            user_prompt = f"""
            Create a detailed, week-by-week career roadmap for:
            - Role: {profile.target_role}
            - Goal: {profile.salary_range} salary
            - Timeline: {duration_weeks} weeks
            - Skills: {', '.join(profile.current_skills)}
            - Bandwidth: {profile.hours_per_week} hrs/week

            REQUIREMENTS:
            1. Return a JSON object with "role" and "steps".
            2. CRITICAL: "steps" must contain EXACTLY {duration_weeks} items. One item per week.
            3. Do not group weeks (e.g. "Weeks 1-4"). List each week individually (1 to {duration_weeks}).
            4. Each step needs: "week" (int), "title", "description", "resources".
            5. "resources" must be a list of 4 to 9 objects: {{"title": "Resource Name", "url": "Valid URL or empty string"}}.
            6. CRITICAL: Resources must include a mix of Official Docs, YouTube Tutorials, and Articles.
            7. STRICT: No markdown code blocks (no ```json). Return raw JSON only.
            
            JSON SCHEMA:
            {{
              "role": "Refined Role Title",
              "steps": [
                {{
                  "week": 1,
                  "title": "Topic Title",
                  "description": "Brief instructions...",
                  "resources": []
                }}
              ]
            }}
            """
            
            log_debug(f"Sending prompt to OpenRouter (xiaomi/mimo-v2-flash:free)...")
            
            completion = or_client.chat.completions.create(
                model="xiaomi/mimo-v2-flash:free", 
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ]
            )
            
            text_response = completion.choices[0].message.content
            log_debug("OpenRouter response received.")

            # Robust JSON Extraction
            try:
                start_index = text_response.find('{')
                end_index = text_response.rfind('}')
                if start_index != -1 and end_index != -1:
                    clean_json = text_response[start_index:end_index+1]
                    data = json.loads(clean_json)
                    roadmap = Roadmap(**data)
                    log_debug(f"Successfully parsed {len(roadmap.steps)} weeks of AI data.")
                    
                    # --- ENRICHMENT STEP ---
                    log_debug("Enriching resources with real links...")
                    # Note: search_link needs to be defined or imported. 
                    # Assuming it's not defined in the scope based on previous read, 
                    # disabling enrichment temporarily to prevent NameError, or using mock links.
                    # Or I can add a simple mock enricher here if search_link is missing.
                    # Checking imports... from duckduckgo_search import DDGS is there.
                    # I'll implement a simple inline search here to be safe.
                    
                    try:
                        ddgs = DDGS()
                        for step in roadmap.steps:
                            for res in step.resources:
                                if not res.url or len(res.url.strip()) == 0:
                                    search_query = f"{res.title} {profile.target_role} tutorial"
                                    # Simple synchronous search
                                    results = list(ddgs.text(search_query, max_results=1))
                                    if results:
                                        res.url = results[0]['href']
                                        log_debug(f"  + Linked '{res.title}' -> {res.url}")
                    except Exception as e:
                         log_debug(f"Enrichment warning: {e}")
                    # -----------------------

                else:
                    raise ValueError("No JSON block found")
            except Exception as e:
                log_debug(f"JSON Parse Error: {e}. Raw: {text_response[:100]}...")
                raise e

        except Exception as e:
            log_debug(f"ERROR in OpenRouter Flow: {e}")
            import traceback
            traceback.print_exc()
            roadmap = generate_mock_roadmap(profile)

    # Save to MongoDB or Mock
    roadmap.user_email = current_user["email"]
    
    try:
        existing_roadmap = await db.roadmaps.find_one({"user_email": current_user["email"]})
        if existing_roadmap:
            await db.roadmaps.replace_one({"user_email": current_user["email"]}, roadmap.dict())
        else:
            await db.roadmaps.insert_one(roadmap.dict())
    except Exception as e:
        log_debug(f"WARNING: DB Save failed ({e}). Using Mock Storage.")
        MOCK_ROADMAPS[current_user["email"]] = roadmap.dict()
        
    return roadmap

@app.get("/roadmap", response_model=Roadmap)
async def get_roadmap(current_user: dict = Depends(get_current_user)):
    roadmap = None
    try:
        roadmap = await db.roadmaps.find_one({"user_email": current_user["email"]})
    except Exception:
        pass
        
    if not roadmap:
        roadmap = MOCK_ROADMAPS.get(current_user["email"])
        
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    return roadmap

@app.put("/roadmap/progress")
async def update_progress(step_update: dict, current_user: dict = Depends(get_current_user)):
    # step_update expects { "week": 1, "completed": true }
    week = step_update.get("week")
    completed = step_update.get("completed")
    
    try:
        result = await db.roadmaps.update_one(
            {"user_email": current_user["email"], "steps.week": week},
            {"$set": {"steps.$.completed": completed}}
        )
        if result.modified_count == 0:
             raise Exception("No DB mod")
    except Exception as e:
        print(f"WARNING: DB Update failed ({e}). Using Mock.")
        roadmap = MOCK_ROADMAPS.get(current_user["email"])
        if roadmap:
            for step in roadmap["steps"]:
                if step["week"] == week:
                    step["completed"] = completed
                    return {"message": "Progress updated (Mock)"}
        raise HTTPException(status_code=400, detail="Update failed")
        
    return {"message": "Progress updated"}


def generate_mock_roadmap(profile: UserProfile) -> Roadmap:
    role = profile.target_role
    print("NOTE: Generating SIMULATED roadmap (OpenRouter Key missing).")
    steps = [
        RoadmapStep(
            week=1, 
            title=f"Foundations of {role}", 
            description="Master the core concepts and syntax. [SIMULATION MODE]",
            resources=[
                Resource(title="Official Documentation", url="https://docs.python.org/3/"),
                Resource(title="Full Course for Beginners", url="https://www.youtube.com/watch?v=rfscVS0vtbw")
            ]
        ),
        RoadmapStep(
            week=2, 
            title="Advanced Topics & Best Practices", 
            description="Deep dive into memory management, concurrency, or advanced patterns.",
            resources=[
                Resource(title="Cosmic Python (Architecture Patterns)", url="https://www.cosmicpython.com/book/chapter_01_domain_model.html"),
                Resource(title="Real Python Tutorials", url="https://realpython.com/")
            ]
        ),
        RoadmapStep(
            week=3, 
            title="Build a Portfolio Project", 
            description="Apply what you learned by building a real-world application.",
            resources=[
                Resource(title="Mega Project List", url="https://github.com/karan/Projects"),
                Resource(title="Deploying Python Apps", url="https://vercel.com/docs/functions/serverless-functions/runtimes/python")
            ]
        ),
        RoadmapStep(
            week=4, 
            title="Interview Prep & System Design", 
            description="Prepare for technical interviews.",
            resources=[
                Resource(title="Blind 75 LeetCode", url="https://leetcode.com/discuss/general-discussion/460599/blind-75-leetcode-questions"),
                Resource(title="System Design Primer", url="https://github.com/donnemartin/system-design-primer")
            ]
        )
    ]
    
    if "month" in profile.timeline:
        steps.append(RoadmapStep(week=5, title="Job Application Strategy", description="Job search and outreach.", resources=[
            Resource(title="Resume Guide", url="https://www.levels.fyi/blog/software-engineer-resume-guide.html"),
            Resource(title="Tech Interview Handbook", url="https://www.techinterviewhandbook.org/")
        ]))

    return Roadmap(role=role, steps=steps)

def stringify_objectid(data):
    if isinstance(data, list):
        return [stringify_objectid(item) for item in data]
    if isinstance(data, dict):
        return {k: stringify_objectid(v) for k, v in data.items()}
    if isinstance(data, ObjectId):
        return str(data)
    if hasattr(data, "dict"): # Handle Pydantic models
        return stringify_objectid(data.dict())
    return data

class QuizRequest(BaseModel):
    topic: str
    role: str
    description: str

class QuizQuestion(BaseModel):
    id: int
    question: str
    options: List[str]
    correct_index: int

class QuizResponse(BaseModel):
    questions: List[QuizQuestion]

@app.post("/generate-quiz", response_model=QuizResponse)
async def generate_quiz(request: QuizRequest, current_user: dict = Depends(get_current_user)):
    load_dotenv(override=True)
    current_key = os.getenv("OPENROUTER_API_KEY")
    
    log_debug(f"Generating quiz for {request.topic}")

    system_prompt = "You are a technical examiner. Output STRICT JSON only."
    user_prompt = f"""
    Create a short, challenging multiple-choice quiz (5 questions) to test understanding of:
    - Topic: {request.topic}
    - Context: {request.role}
    - Details: {request.description}

    REQUIREMENTS:
    1. Return JSON with a "questions" array.
    2. Each question needs: "id" (1-5), "question" (string), "options" (array of 4 strings), "correct_index" (int 0-3).
    3. Questions should test practical understanding, not just definitions.
    4. NO markdown, just raw JSON.

    JSON SCHEMA:
    {{
      "questions": [
        {{
          "id": 1,
          "question": "What is...?",
          "options": ["Op1", "Op2", "Op3", "Op4"],
          "correct_index": 0
        }}
      ]
    }}
    """

    if not current_key:
        # Mock Quiz Fallback
        return QuizResponse(questions=[
            QuizQuestion(id=i, question=f"Mock Question {i} about {request.topic}?", options=["Wrong", "Correct", "Wrong", "Wrong"], correct_index=1)
            for i in range(1, 6)
        ])

    try:
        or_client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=current_key,
            timeout=30.0
        )
        
        completion = or_client.chat.completions.create(
            model="xiaomi/mimo-v2-flash:free", 
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]
        )
        
        text_response = completion.choices[0].message.content
        
        # Clean JSON
        start_index = text_response.find('{')
        end_index = text_response.rfind('}')
        if start_index != -1 and end_index != -1:
            clean_json = text_response[start_index:end_index+1]
            data = json.loads(clean_json)
            return QuizResponse(**data)
        else:
             raise ValueError("No JSON found")

    except Exception as e:
        log_debug(f"Quiz Gen Error: {e}")
        # Fallback
        return QuizResponse(questions=[
            QuizQuestion(id=i, question=f"Fallback Question {i}: {request.topic}", options=["A", "B", "C", "D"], correct_index=0)
            for i in range(1, 6)
        ])

@app.get('/public/profile/{user_id}')
async def get_public_profile(user_id: str):
    try:
        user = None
        roadmap = None

        # Handle 'demo' special case
        if user_id == 'demo':
            user = next((u for u in MOCK_USERS if u['email'] == 'demo@pathos.dev'), None)
            if user:
                 roadmap = MOCK_ROADMAPS.get('demo@pathos.dev')
        
        # Try MongoDB
        if not user and ObjectId.is_valid(user_id):
            try:
                user = await db.users.find_one({'_id': ObjectId(user_id)})
            except Exception as e:
                print(f'DB Error: {e}')
        
        if not user:
            raise HTTPException(status_code=404, detail='User not found')

        # Get Roadmap
        try:
            roadmap = await db.roadmaps.find_one({'user_email': user['email']})
        except:
            pass
        
        if not roadmap:
            # Check Mock
            roadmap = MOCK_ROADMAPS.get(user['email'])

        # Calculate Stats
        total_steps = 0
        completed_steps = 0
        role = 'Undecided'
        
        if roadmap:
            # If roadmap is a Pydantic model (from mock), convert to dict
            if hasattr(roadmap, "dict"):
                roadmap_dict = roadmap.dict()
            else:
                roadmap_dict = roadmap
                
            role = roadmap_dict.get('role', 'Undecided')
            steps = roadmap_dict.get('steps', [])
            total_steps = len(steps)
            completed_steps = sum(1 for s in steps if s.get('completed', False))
            roadmap_to_return = roadmap_dict
        else:
            roadmap_to_return = None

        response_data = {
            'name': user.get('name', 'Anonymous'),
            'role': role,
            'stats': {
                'total': total_steps,
                'completed': completed_steps,
                'percent': int((completed_steps / total_steps * 100) if total_steps > 0 else 0)
            },
            'roadmap': roadmap_to_return
        }
        
        return stringify_objectid(response_data)
    except HTTPException as he:
        raise he
    except Exception as e:
        # Return the actual error for debugging
        import traceback
        return {
            "error": str(e),
            "traceback": traceback.format_exc()
        }



@app.get('/auth/me')
async def get_me(current_user: dict = Depends(get_current_user)):
    # Returns the logged in user info
    return {
        'id': str(current_user.get('_id', 'demo')),
        'name': current_user.get('name'),
        'email': current_user.get('email')
    }

