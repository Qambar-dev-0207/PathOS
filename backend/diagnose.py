import subprocess
import time
import requests
import sys
import os

def run_diagnostic():
    print("--- Diagnostic Start ---")
    
    # Path to venv python
    venv_python = os.path.join("venv", "Scripts", "python.exe")
    if not os.path.exists(venv_python):
        print(f"Error: venv python not found at {venv_python}")
        return

    # Start Uvicorn
    print("Starting Uvicorn...")
    proc = subprocess.Popen(
        [venv_python, "-m", "uvicorn", "main:app", "--port", "8000", "--no-access-log"],
        cwd=".",
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    
    time.sleep(3)
    
    if proc.poll() is not None:
        print("Uvicorn died immediately!")
        print(proc.stdout.read())
        print(proc.stderr.read())
        return

    print("Uvicorn running. Attempting request...")
    try:
        resp = requests.get("http://localhost:8000/", timeout=2)
        print(f"Root endpoint status: {resp.status_code}")
        print(f"Response: {resp.text}")
        
        print("Attempting Register...")
        resp = requests.post(
            "http://localhost:8000/register",
            json={"name": "Diag", "email": "diag@test.com", "password": "123"},
            timeout=5
        )
        print(f"Register status: {resp.status_code}")
        print(f"Register Response: {resp.text}")
        
    except Exception as e:
        print(f"Request failed: {e}")
        # Print server output to see if it logged the request
        # Note: reading stdout might block if buffer empty, but we are killing it soon.
    
    print("Killing Uvicorn...")
    proc.terminate()
    try:
        outs, errs = proc.communicate(timeout=2)
        print("--- Server Output ---")
        print(outs)
        print("--- Server Errors ---")
        print(errs)
    except subprocess.TimeoutExpired:
        proc.kill()
        print("Server killed forcefully.")

if __name__ == "__main__":
    run_diagnostic()
