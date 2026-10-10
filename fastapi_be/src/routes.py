from fastapi import APIRouter, Depends, Path, Query, Body, Request, Response, HTTPException, status
from bson import ObjectId
from models import Tea, Address, Student, UserInDB, UserOut, Book
from typing import List
from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError
from dotenv import dotenv_values
from Database import database
from fastapi.security import OAuth2PasswordRequestForm
from jwt_handler import create_access_token, verify_token


students_collection = database["students"]
book_collection = database["Books"]

router = APIRouter()

#@router.post("/login")
#def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
#    user = authenticate_user(db, form_data.username, form_data.password)
 #   if not user:
  #      raise HTTPException(status_code=400, detail="Invalid credentials")
  #  access_token = create_access_token(data={"user_id": user.id})
  #  return {"access_token": access_token, "token_type": "bearer"}

@router.post("/students", status_code=201)
async def create_student(student: Student):
    result = students_collection.insert_one(student.model_dump())
    new_student = students_collection.find_one({"_id": result.inserted_id}, {"_id": 0})
    return new_student

@router.get("/students", response_model=list[Student])
async def list_students(country: str = None, age: int = None):
    try:
        query = {}
        if country:
            query["address.country"] = country
        if age:
            query["age"] = {"$gte": age}
        students = list(students_collection.find(query, {"_id": 0}))
        return students
    except ServerSelectionTimeoutError:
        raise HTTPException(status_code=503, detail="Database connection failed. Please try again later.")


@router.get("/students/{id}", response_model=Student)
async def get_student(id: str):
    student = students_collection.find_one({"_id": ObjectId(id)}, {"_id": 0})
    if student:
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
async def create_user(user: UserInDB):
    # Even though we return the full UserInDB (with hashed_password),
    # FastAPI will filter it and only return what is in UserOut.
    return user

@router.post("/add_new", status_code=status.HTTP_201_CREATED)
def add_book(b1: Book):
    result = book_collection.insert_one(b1.dict())
    ack = result.acknowledged
    return {"insertion": ack}

@router.get("/")
def read_root():
    return {"message": "Hello..."}

@router.get("/hello")
async def hello(name:str,age:int):
   return {"name": name, "age":age}

@router.get("/hello/{name}")
async def hello(name:str=Path(...,min_length=3,max_length=10)):
   return {"name": name}

@router.get("/hello/{name}/{age}")
async def hello(*, name: str=Path(...,min_length=3 , max_length=10), age: int = Path(..., ge=1, le=100)):
   return {"name": name, "age":age}

@router.get("/hello2/{name}/{age}")
async def hello2(*, name: str=Path(...,min_length=3 , max_length=10), age: int = Path(..., ge=1, le=100), percent:float=Query(..., ge=0, le=100)):
	return {"name": name, "age":age}

