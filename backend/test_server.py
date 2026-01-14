import requests
import sys

BASE_URL = "http://localhost:8002"

def run_test():
    print(f"Testing connectivity to {BASE_URL}...")
    try:
        r = requests.get(f"{BASE_URL}/health")
        print(f"Health Check: {r.status_code} {r.json()}")
    except Exception as e:
        print(f"Server unreachable: {e}")
        return

    email = "test_auto@pathos.dev"
    password = "password123"

    # 1. Register
    print(f"\n1. Registering {email}...")
    payload = {"name": "Test User", "email": email, "password": password}
    r = requests.post(f"{BASE_URL}/register", json=payload)
    if r.status_code == 200:
        print("   Success! Token received.")
        token = r.json()["access_token"]
    elif r.status_code == 400 and "registered" in r.text:
        print("   User already exists. Trying login...")
        # Login instead
        r = requests.post(f"{BASE_URL}/login", json={"email": email, "password": password})
        if r.status_code == 200:
             print("   Login Success!")
             token = r.json()["access_token"]
        else:
             print(f"   Login Failed: {r.text}")
             return
    else:
        print(f"   Registration Failed: {r.status_code} {r.text}")
        return

    # 2. Auth Me
    print(f"\n2. Verifying Token via GET /auth/me...")
    headers = {"Authorization": f"Bearer {token}"}
    r = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    print(f"   Status: {r.status_code}")
    print(f"   Response: {r.text}")

if __name__ == "__main__":
    run_test()
