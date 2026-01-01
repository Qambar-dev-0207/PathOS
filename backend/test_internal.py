from fastapi.testclient import TestClient
from main import app
import os

# Ensure Mock DB is used
os.environ["USE_MOCK_DB"] = "true"

client = TestClient(app)

def test_internal_flow():
    print("Testing Internal Flow via TestClient...")
    
    # 1. Login/Register
    email = "internal_test@example.com"
    password = "password123"
    
    print("Registering...")
    res = client.post("/register", json={"name": "Internal", "email": email, "password": password})
    if res.status_code != 200:
        print(f"Registration failed: {res.text}")
        # Try login
        res = client.post("/login", json={"email": email, "password": password})
    
    assert res.status_code == 200, f"Auth failed: {res.text}"
    token = res.json()["access_token"]
    print("Auth successful.")
    
    # 2. Generate Roadmap
    headers = {"Authorization": f"Bearer {token}"}
    profile = {
        "target_role": "Python Dev",
        "salary_range": "$100k",
        "timeline": "4 weeks",
        "current_skills": ["Python"],
        "hours_per_week": 10
    }
    
    print("Generating Roadmap...")
    res = client.post("/generate-roadmap", json=profile, headers=headers)
    assert res.status_code == 200, f"Generation failed: {res.text}"
    
    data = res.json()
    print("Roadmap Generated!")
    print(f"Steps: {len(data['steps'])}")
    for step in data['steps']:
        print(f"Week {step['week']}: {len(step['resources'])} resources")

if __name__ == "__main__":
    test_internal_flow()
