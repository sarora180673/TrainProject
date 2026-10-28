from fastapi import APIRouter, Depends, Path, Query, Body, Request, Response, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from bson import ObjectId
from models import Tea, Address, Student, UserInDB, UserOut, Book, StudentPublic
from typing import List
from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError
from dotenv import dotenv_values
from Database import database
from passlib.context import CryptContext
from jwt_handler import create_access_token, verify_token
import os
import smtplib
from email.mime.text import MIMEText
from datetime import datetime
from urllib.parse import quote


students_collection = database["students"]
book_collection = database["Books"]
payments_collection = database["payments"]

router = APIRouter()
# Use a scheme that works reliably with the installed versions of passlib + bcrypt.
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


def send_verification_email(email: str, username: str, token: str):
    verification_url = f"http://localhost:8002/api/verify-email?token={token}"
    subject = "Verify your email"
    body = (
        f"Hi {username},\n\n"
        f"Please verify your email by visiting the link below:\n\n"
        f"{verification_url}\n\n"
        "If you did not create this account, you can ignore this email."
    )

    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    smtp_from = os.getenv("SMTP_FROM", "noreply@example.com")

    if smtp_host and smtp_user and smtp_password:
        msg = MIMEText(body)
        msg["Subject"] = subject
        msg["From"] = smtp_from
        msg["To"] = email
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.sendmail(smtp_from, [email], msg.as_string())
        return

    print(f"[MOCK EMAIL] To: {email}\nSubject: {subject}\n{body}")


@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = students_collection.find_one({"username": form_data.username})
    if not user or not pwd_context.verify(form_data.password, user.get("hashed_password", "")):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    token = create_access_token({"sub": user["username"]})
    return {"access_token": token, "token_type": "bearer"}

@router.get("/verify")
def verify(token: str):
    data = verify_token(token)
    if not data:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return {"user": data["sub"]}

@router.get("/verify-email")
def verify_email(token: str):
    data = verify_token(token)
    if not data or data.get("purpose") != "email_verification":
        raise HTTPException(status_code=401, detail="Invalid or expired verification token")

    email = data.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Verification token missing email")

    user = students_collection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    students_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {"is_active": True, "email_verified_at": datetime.utcnow()}}
    )
    return {"message": "Email verified successfully", "username": user["username"]}

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    data = verify_token(token)
    if not data:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return data

@router.get("/")
def home():
    return {"message": "Welcome to the public route"}

@router.get("/dashboard")
def dashboard(current_user: dict = Depends(get_current_user)):
    return {"message": f"Welcome {current_user['sub']}! This is a protected route."}


@router.post("/students", status_code=201)
async def create_student(student: Student):
    result = students_collection.insert_one(student.model_dump())
    new_student = students_collection.find_one({"_id": result.inserted_id}, {"_id": 0})
    return new_student

@router.get("/students", response_model=list[StudentPublic])
async def list_students(country: str = None, age: int = None):
    try:
        query = {}
        if country:
            query["address.country"] = country
        if age:
            query["age"] = {"$gte": age}
        students = list(students_collection.find(query, {"_id": 0}))
        cleaned_students = []
        for student in students:
            student.pop("hashed_password", None)
            cleaned_students.append(student)
        return cleaned_students
    except ServerSelectionTimeoutError:
        raise HTTPException(status_code=503, detail="Database connection failed. Please try again later.")


@router.get("/students/{id}", response_model=StudentPublic)
async def get_student(id: str):
    student = students_collection.find_one({"_id": ObjectId(id)}, {"_id": 0})
    if student:
        student.pop("hashed_password", None)
        return student
    else:
        raise HTTPException(status_code=404, detail="Student not found")


@router.patch("/students/{id}", status_code=204)
async def update_student(id: str, student: Student):
    updated_student = student.model_dump(exclude_unset=True)
    result = students_collection.update_one(
        {"_id": ObjectId(id)}, {"$set": updated_student})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Student not found")
    else:
        return


@router.delete("/students/{id}", status_code=200)
async def delete_student(id: str):
    result = students_collection.delete_one({"_id": ObjectId(id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Student not found")
    else:
        return {"message": "Student deleted successfully"}


@router.post("/greet")
def greet_user(name: str, age:int):
    return {"message": f"Hello, {name}!, your age is: {age}"}

@router.post("/users/", response_model=UserOut)
async def create_user(user: Student):
    existing_user = students_collection.find_one({"username": user.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")

    existing_email = students_collection.find_one({"email": user.email})
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_data = user.model_dump()
    user_data["hashed_password"] = pwd_context.hash(user.hashed_password)
    user_data["is_active"] = True

    result = students_collection.insert_one(user_data)
    verification_token = create_access_token(
        {"sub": user.username, "email": user.email, "purpose": "email_verification"},
        expires_minutes=1440,
    )
    send_verification_email(user.email, user.username, verification_token)

    return {"username": user.username, "email": user.email}

@router.post("/register", response_model=UserOut)
async def register_user(user: Student):
    return await create_user(user)

@router.post("/payments/upi")
def create_upi_payment(
    payment: dict,
    current_user: dict = Depends(get_current_user),
):
    upi_id = str(payment.get("upi_id", "")).strip()
    amount = payment.get("amount")
    currency = str(payment.get("currency", "INR")).upper()
    purpose = payment.get("purpose", "Training payment")

    if not upi_id or "@" not in upi_id:
        raise HTTPException(status_code=400, detail="Valid UPI ID is required")

    try:
        amount_value = float(amount)
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail="Amount must be a valid number")

    if amount_value <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than zero")

    payment_id = f"UPI-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{os.urandom(4).hex()}"
    payer_name = current_user.get("sub", "customer")
    upi_link = (
        f"upi://pay?pa={quote(upi_id)}&pn={quote(payer_name)}&am={amount_value}&cu={currency}&tn={quote(purpose)}"
    )

    payment_record = {
        "payment_id": payment_id,
        "user": payer_name,
        "method": "UPI",
        "upi_id": upi_id,
        "amount": amount_value,
        "currency": currency,
        "purpose": purpose,
        "status": "initiated",
        "gateway_reference": payment_id,
        "payment_url": upi_link,
        "created_at": datetime.utcnow(),
    }
    payments_collection.insert_one(payment_record)

    return {
        "status": "initiated",
        "gateway": "UPI",
        "payment_id": payment_id,
        "amount": amount_value,
        "currency": currency,
        "payment_url": upi_link,
        "message": "UPI payment request created successfully",
    }


@router.get("/payments/upi/{payment_id}")
def get_upi_payment_status(payment_id: str, current_user: dict = Depends(get_current_user)):
    payment = payments_collection.find_one({"payment_id": payment_id, "user": current_user.get("sub")})
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    return {
        "payment_id": payment["payment_id"],
        "status": payment["status"],
        "amount": payment["amount"],
        "currency": payment["currency"],
        "upi_id": payment["upi_id"],
    }
