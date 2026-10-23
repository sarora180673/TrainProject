from pydantic import BaseModel, EmailStr
from typing import List

class Tea(BaseModel):
    id: int
    name: str
    origin: str
   
teas: List[Tea] = []

class Address(BaseModel):
    city: str
    country: str

class Student(BaseModel):
    username: str
    hashed_password: str
    email: EmailStr
    is_active: bool = True
    name: str
    age: int
    address: Address


class Book(BaseModel):
   bookID: int
   title: str
   author:str
   publisher: str

class UserInDB(BaseModel):
    username: str
    hashed_password: str
    email: EmailStr
    is_active: bool = True

# Public 'Response' representation (hides the password)
class UserOut(BaseModel):
    username: str
    email: EmailStr