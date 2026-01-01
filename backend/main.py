from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import json
import re
from datetime import datetime, timedelta

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
    allow_origins=["*"], # Relaxed for debugging
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Configuration ---
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

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
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    
    user = None
    try:
        user = await db.users.find_one({"email": token_data.email})
    except Exception:
        pass
        
    if user is None:
        # Check mock
        user = next((u for u in MOCK_USERS if u["email"] == token_data.email), None)
        
    if user is None:
        raise credentials_exception
    return user

# --- Routes ---

@app.get("/")
def read_root():
    return {"message": "AI Career Roadmap Generator API"}

# ... imports

# --- Mock Storage (Fallback) ---
MOCK_USERS = []
MOCK_ROADMAPS = {}

# ... (rest of configuration)

@app.post("/register", response_model=Token)
async def register(user: UserCreate):
    print(f"DEBUG: Register attempt for {user.email}")
    hashed_password = get_password_hash(user.password)
    new_user = {
        "name": user.name,
        "email": user.email,
        "hashed_password": hashed_password
    }
    
    try:
        # Try MongoDB
        existing_user = await db.users.find_one({"email": user.email})
        if existing_user:
            print("DEBUG: Email already registered (DB)")
            raise HTTPException(status_code=400, detail="Email already registered")
        
        await db.users.insert_one(new_user)
        print("DEBUG: User created successfully in DB")
    except Exception as e:
        print(f"WARNING: MongoDB failed ({e}). Using Mock Storage.")
        # Mock Fallback
        if any(u['email'] == user.email for u in MOCK_USERS):
             raise HTTPException(status_code=400, detail="Email already registered (Mock)")
        MOCK_USERS.append(new_user)
        print("DEBUG: User created in Mock Storage")
        
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/login", response_model=Token)
async def login(user: UserLogin):
    print(f"DEBUG: Login attempt for {user.email}")
    db_user = None
    try:
        db_user = await db.users.find_one({"email": user.email})
    except Exception as e:
        print(f"WARNING: MongoDB failed ({e}). Checking Mock Storage.")
        db_user = next((u for u in MOCK_USERS if u["email"] == user.email), None)

    if not db_user:
        print("DEBUG: User not found")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not verify_password(user.password, db_user["hashed_password"]):
        print("DEBUG: Password verification failed")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    print("DEBUG: Password verified. Generating token...")
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/generate-roadmap", response_model=Roadmap)
async def generate_roadmap(profile: UserProfile, current_user: dict = Depends(get_current_user)):
    # Force reload env
    load_dotenv(override=True)
    current_key = os.getenv("OPENROUTER_API_KEY")
    
    print(f"DEBUG: Generating roadmap for {profile.target_role}")
    
    # 1. Check if API Key is valid
    if not current_key:
        print("CRITICAL: No valid OPENROUTER_API_KEY found. Falling back to Mock Data.")
        roadmap = generate_mock_roadmap(profile)
    else:
        try:
            # Re-init client to be sure
            or_client = OpenAI(
                base_url="https://openrouter.ai/api/v1",
                api_key=current_key,
            )

            # Calculate approximate weeks
            duration_weeks = 12 # Default
            timeline_str = profile.timeline.lower().replace(" ", "")
            if "month" in timeline_str:
                try:
                    months = int(re.search(r'(\d+)', timeline_str).group(1))
                    duration_weeks = months * 4
                except: pass
            elif "week" in timeline_str:
                try:
                    duration_weeks = int(re.search(r'(\d+)', timeline_str).group(1))
                except: pass
            
            print(f"DEBUG: Calculated duration_weeks: {duration_weeks} (Input: {profile.timeline})")

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
            5. "resources" must be a list of objects: {{"title": "Resource Name", "url": "Valid URL or empty string"}}
            6. STRICT: No markdown code blocks (no ```json). Return raw JSON only.
            
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
            
            print(f"DEBUG: Sending prompt to OpenRouter (xiaomi/mimo-v2-flash:free)...")
            
            stream = or_client.chat.completions.create(
                model="xiaomi/mimo-v2-flash:free", 
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                stream=True,
                stream_options={"include_usage": True}
            )
            
            text_response = ""
            for chunk in stream:
                if chunk.choices and len(chunk.choices) > 0:
                    content = chunk.choices[0].delta.content
                    if content:
                        text_response += content
                
                # Usage information usually comes in the final chunk
                if hasattr(chunk, 'usage') and chunk.usage:
                    # OpenRouter uses 'reasoning_tokens' in the usage object
                    reasoning = getattr(chunk.usage, "reasoning_tokens", "N/A")
                    print(f"\nDEBUG: Generation complete. Reasoning tokens: {reasoning}")

            print("DEBUG: OpenRouter response received.")

            # Robust JSON Extraction
            try:
                start_index = text_response.find('{')
                end_index = text_response.rfind('}')
                if start_index != -1 and end_index != -1:
                    clean_json = text_response[start_index:end_index+1]
                    data = json.loads(clean_json)
                    roadmap = Roadmap(**data)
                    print(f"DEBUG: Successfully parsed {len(roadmap.steps)} weeks of AI data.")
                    
                    # --- ENRICHMENT STEP ---
                    print("DEBUG: Enriching resources with real links...")
                    for step in roadmap.steps:
                        for res in step.resources:
                            if not res.url or len(res.url.strip()) == 0:
                                search_query = f"{res.title} {profile.target_role} tutorial"
                                found_url = search_link(search_query)
                                if found_url:
                                    res.url = found_url
                                    print(f"  + Linked '{res.title}' -> {found_url}")
                    # -----------------------

                else:
                    raise ValueError("No JSON block found")
            except Exception as e:
                print(f"JSON Parse Error: {e}. Raw: {text_response[:100]}...")
                raise e

        except Exception as e:
            print(f"ERROR in OpenRouter Flow: {e}")
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
        print(f"WARNING: DB Save failed ({e}). Using Mock Storage.")
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