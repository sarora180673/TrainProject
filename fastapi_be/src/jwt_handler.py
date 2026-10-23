from datetime import datetime, timedelta
from pathlib import Path
import os

from dotenv import dotenv_values
from jose import jwt, JWTError

base_dir = Path(__file__).resolve().parent
config = dotenv_values(base_dir / ".env")
if not config:
    config = dotenv_values(base_dir.parent / ".env")

SECRET_KEY = config.get("SECRET_KEY") or os.getenv("SECRET_KEY")
ALGORITHM = config.get("ALGORITHM") or os.getenv("ALGORITHM")

def create_access_token(data: dict, expires_minutes: int = 30):
    data_copy = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=expires_minutes)
    data_copy.update({"exp": expire})
    return jwt.encode(data_copy, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None              