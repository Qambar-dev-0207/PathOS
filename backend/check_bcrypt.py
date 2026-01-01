try:
    import bcrypt
    print(f"bcrypt version: {bcrypt.__version__}")
except ImportError:
    print("bcrypt not found")

try:
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    print(f"Hash: {pwd_context.hash('test')}")
    print("Passlib + Bcrypt working!")
except Exception as e:
    print(f"Passlib Error: {e}")
