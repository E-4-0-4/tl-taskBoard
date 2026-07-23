import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { NextResponse } from "next/server";



export async function POST(request: Request) {
  const {name, email, password } = await request.json();
 console.log(name, email, password);

 if (!name || !email || !password) {
    return NextResponse.json(
      { error: "Name, email, and password are required." },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json( 
      { error: "Password must be at least 6 characters long." },
      { status: 400 }
    );
  }

//check if user already exists
const user = await prisma.user.findUnique({
  where: { email },
});
if (user) {
  return NextResponse.json({ message: "User already exists" }, { status: 400 });
}

//hash password
const hashedPassword = await bcrypt.hash(password, 10);

//create user
const userCreated = await prisma.user.create({
  data: { name, email, password: hashedPassword },
});

if (!userCreated) {
  return NextResponse.json({ message: "Failed to create user" }, { status: 500 });
}

return NextResponse.json({ message: "User created successfully" }, { status: 201 });







}
