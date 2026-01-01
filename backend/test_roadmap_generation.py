import requests
import json
import time

BASE_URL = "http://localhost:8002"

import random

def test_roadmap_flow():
    print("--- Testing Roadmap Generation with Resource Enrichment ---")
    
    # 1. Login/Register
    rand_id = random.randint(1000, 9999)
    email = f"test_enrich_{rand_id}@example.com"
    password = "password123"
    token = None

    try:
        print(f"Logging in as {email}...")
        res = requests.post(f"{BASE_URL}/login", json={"email": email, "password": password})
        if res.status_code == 200:
            token = res.json()["access_token"]
        else:
            print("Login failed, registering...")
            res = requests.post(f"{BASE_URL}/register", json={"name": "Enrich Tester", "email": email, "password": password})
            if res.status_code == 200:
                token = res.json()["access_token"]
            else:
                print(f"Registration failed: {res.text}")
                return
    except Exception as e:
        print(f"Connection failed: {e}")
        return

    print("Token acquired.")

    # 2. Generate Roadmap
    print("Requesting roadmap generation (this triggers the AI and Search)...")
    # Using a short timeline to speed up the test
    profile = {
        "target_role": "Python Backend Developer",
        "salary_range": "$120,000",
        "timeline": "6 months", 
        "current_skills": ["Python", "Basic SQL"],
        "hours_per_week": 20
    }
    
    headers = {"Authorization": f"Bearer {token}"}
    
    start_time = time.time()
    try:
        # Increase timeout because AI + Search takes time
        res = requests.post(f"{BASE_URL}/generate-roadmap", json=profile, headers=headers, timeout=120)
        
        if res.status_code == 200:
            data = res.json()
            print(f"\nSUCCESS! Roadmap generated in {time.time() - start_time:.2f}s")
            print(f"Role: {data['role']}")
            print(f"Steps: {len(data['steps'])}")
            
            # Check for links
            print("\n--- Resource Link Check ---")
            link_count = 0
            total_resources = 0
            for step in data['steps']:
                print(f"Week {step['week']}: {step['title']}")
                for r in step['resources']:
                    total_resources += 1
                    status = "✅ Found URL" if r.get('url') else "❌ No URL"
                    if r.get('url'): link_count += 1
                    print(f"  - {r['title']}: {r.get('url', '')} [{status}]")
            
            print(f"\nSummary: {link_count}/{total_resources} resources have links.")
            
        else:
            print(f"FAILED: {res.status_code} - {res.text}")
            
    except Exception as e:
        print(f"Error during generation: {e}")

if __name__ == "__main__":
    test_roadmap_flow()
