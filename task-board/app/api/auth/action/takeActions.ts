"use server";

import { Status } from "@/app/generated/prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Helper to authenticate user using NextAuth v5
async function getAuthUser() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized: Please log in.");
  return session.user;
}

// 1. Fetch All Tasks
export async function getTasks() {
  await getAuthUser();
  return await prisma.task.findMany({
    include: {
      assignedTo: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

// 2. Create Task (ADMIN ONLY)
export async function createTask(formData: FormData) {
  const user = await getAuthUser();

  if ((user as any).role !== "ADMIN") {
    throw new Error("Forbidden: Only Administrators can create tasks.");
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const assignedToId = formData.get("assignedToId") as string;

  if (!title || !assignedToId) {
    throw new Error("Title and assigned user are required.");
  }

  await prisma.task.create({
    data: {
      title,
      description: description || "",
      status: "TODO",
      assignedTo: {
        connect: { id: assignedToId },
      },
    },
  });

  revalidatePath("/dashboard");
}

// 3. Update Task Status (ADMIN: Any Task | MEMBER: Assigned Tasks Only)
export async function updateTaskStatus(
  taskId: string,
  newStatus: Status
) {
  const user = await getAuthUser();

  const existingTask = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!existingTask) throw new Error("Task not found.");

  const isAdmin = (user as any).role === "ADMIN";
  const isAssignedMember = existingTask?.userId === user.id;

  if (!isAdmin && !isAssignedMember) {
    throw new Error("Forbidden: You can only update tasks assigned to you.");
  }

  await prisma.task.update({
    where: { id: taskId },
    data: { status: newStatus as Status },
  });

  revalidatePath("/dashboard");
}

// 4. Delete Task (ADMIN ONLY)
export async function deleteTask(taskId: string) {
  const user = await getAuthUser();

  if ((user as any).role !== "ADMIN") {
    throw new Error("Forbidden: Only Administrators can delete tasks.");
  }

  await prisma.task.delete({
    where: { id: taskId },
  });

  revalidatePath("/dashboard");
}