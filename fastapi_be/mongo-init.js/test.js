db.students.insertMany([
        {username: "Student1",hashed_password: "abc12345", email: "suresh1@test.com", is_active: true, name:"student1",age:25, address:{city:"Delhi",country:"INDIA"}},
        {username: "Student2",hashed_password: "abc12345", email: "suresh2@test.com", is_active: true, name:"student2",age:26, address:{city:"Noida",country:"INDIA"}},
]);
