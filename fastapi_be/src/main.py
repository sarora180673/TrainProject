import uvicorn
from datetime import datetime, timedelta, timezone
from fastapi import Depends, FastAPI, Path, Query, status, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext
from routes import router as student_router
from fastapi.middleware.cors import CORSMiddleware

# 1. Define the origins that are allowed to make requests to this API
origins = [
    "http://localhost:5173",  # Common React development port
    "http://127.0.0.1:5173",
    "http://172.17.0.3:5173"
]

app = FastAPI(debug=True, title="Test App", version="0.1.0")

# 2. Add the middleware to your FastAPI application instance
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,          # Allows specified origins
    allow_credentials=True,         # Allows cookies and credentials
    allow_methods=["*"],            # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],            # Allows all request headers
)

app.include_router(student_router, prefix="/api", tags=["students"])


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8002, reload=True)
