from pathlib import Path
import os
from dotenv import dotenv_values
from pymongo import MongoClient

base_dir = Path(__file__).resolve().parent.parent
config = dotenv_values(base_dir / ".env")
if not config:
    config = dotenv_values(base_dir.parent / ".env")

DATABASE_URI = config.get("DATABASE_URI") or os.getenv("DATABASE_URI")
DB_NAME = config.get("DB_NAME") or os.getenv("DB_NAME")

if not DATABASE_URI:
    raise RuntimeError("DATABASE_URI is missing. Set it in .env or as an environment variable.")
if not DB_NAME:
    raise RuntimeError("DB_NAME is missing. Set it in .env or as an environment variable.")

client = MongoClient(DATABASE_URI)
database = client[DB_NAME]