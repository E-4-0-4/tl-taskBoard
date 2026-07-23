import { NextResponse } from "next/server";
import { auth } from "@/lib/auth"; // Imports auth() helper directly
import { prisma } from "@/lib/prisma";

export async function GET() {
  // 1. Authenticate session using NextAuth v5 auth()
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized: Please log in." },
      { status: 401 }
    );
  }

  try {
    // 2. Fetch tasks with assigned user information
    const tasks = await prisma.task.findMany({
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // 3. Fetch all members so admins can populate the assignment dropdown
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({ tasks, users });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch taskboard data." },
      { status: 500 }
    );
  }
}