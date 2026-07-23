
"use client";

import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import {
  createTask,
  updateTaskStatus,
  deleteTask,
} from "@/app/api/auth/action/takeActions";

type TaskStatus = "TODO" | "IN_PROCESS" | "DONE";

interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignedToId: string;
  assignedTo: {
    id: string;
    name: string | null;
    email: string;
  };
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<
    { id: string; name: string | null; email: string }[]
  >([]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prevent SSR hydration mismatch for DnD canvas
  const [isMounted, setIsMounted] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedToId, setAssignedToId] = useState("");

  const userRole = (session?.user as any)?.role || "MEMBER";
  const currentUserId = session?.user?.id;
  const isAdmin = userRole === "ADMIN";

  useEffect(() => {
    setIsMounted(true);
    if (status === "authenticated") {
      fetch("/api/tasks")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data.tasks)) setTasks(data.tasks);
          if (Array.isArray(data.users)) setUsers(data.users);
        })
        .catch(() => setError("Failed to load initial taskboard data."));
    }
  }, [status]);

  if (status === "loading" || !isMounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-900 text-zinc-300 font-sans">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <span>Loading Taskboard...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-900 text-zinc-100 font-sans">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center shadow-xl">
          <h2 className="text-xl font-bold text-red-400">Access Denied</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Please sign in to access the taskboard.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="mt-6 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Handle Drag and Drop completion
  const handleOnDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Dropped outside a droppable area
    if (!destination) return;

    // Dropped in the exact same location
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const draggedTask = tasks.find((t) => t.id === draggableId);
    if (!draggedTask) return;

    const isAssignedToMe = draggedTask.assignedToId === currentUserId;
    const canEdit = isAdmin || isAssignedToMe;

    if (!canEdit) {
      setError("Forbidden: You can only update tasks assigned to you.");
      return;
    }

    const newStatus = destination.droppableId as TaskStatus;
    const previousTasks = [...tasks];

    // Optimistically update local state
    setTasks((prev) =>
      prev.map((t) => (t.id === draggableId ? { ...t, status: newStatus } : t))
    );

    try {
      setError(null);
      await updateTaskStatus(draggableId, newStatus);
    } catch (err: any) {
      // Revert back on server error
      setTasks(previousTasks);
      setError(err.message || "Failed to update task status");
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      setError(null);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      await deleteTask(taskId);
    } catch (err: any) {
      setError(err.message || "Failed to delete task");
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("assignedToId", assignedToId);

      await createTask(formData);

      setTitle("");
      setDescription("");
      setIsCreating(false);
      window.location.reload();
    } catch (err: any) {
      setError(err.message || "Failed to create task");
    }
  };

  const columns: { label: string; key: TaskStatus; color: string }[] = [
    { label: "To Do", key: "TODO", color: "border-amber-500/40" },
    { label: "In Process", key: "IN_PROCESS", color: "border-indigo-500/40" },
    { label: "Done", key: "DONE", color: "border-emerald-500/40" },
  ];

  return (
    <div className="min-h-screen bg-zinc-900 font-sans text-zinc-100 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/20">
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 17.25v-10.5a.75.75 0 011.5 0v10.5a.75.75 0 01-1.5 0zM14.25 17.25v-6a.75.75 0 011.5 0v6a.75.75 0 01-1.5 0zM3.75 6.75h16.5M3.75 17.25h16.5"
                />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Taskboard
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-white">
                {session.user?.name || "User"}
              </p>
              <p className="text-xs text-zinc-400">{session.user?.email}</p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                isAdmin
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                  : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
              }`}
            >
              {userRole}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Error Banner */}
        {error && (
          <div className="mb-6 flex items-center justify-between rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            <div>
              <strong>Error:</strong> {error}
            </div>
            <button
              onClick={() => setError(null)}
              className="text-xs font-bold underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Toolbar */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Project Tasks</h1>
            <p className="text-sm text-zinc-400">
              {isAdmin
                ? "Admin Access: Drag & drop any task, create, or delete."
                : "Member Access: Drag & drop tasks assigned to you."}
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={() => setIsCreating(!isCreating)}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:bg-indigo-500 active:scale-[0.98]"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              {isCreating ? "Cancel" : "Create Task"}
            </button>
          )}
        </div>

        {/* Create Task Form */}
        {isCreating && isAdmin && (
          <form
            onSubmit={handleCreateTask}
            className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl space-y-4"
          >
            <h3 className="text-base font-bold text-white">Add New Task</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Task title..."
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">
                  Assign To
                </label>
                <select
                  required
                  value={assignedToId}
                  onChange={(e) => setAssignedToId(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value="">Select Member</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name || u.email}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">
                Description
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description..."
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
            >
              Save Task
            </button>
          </form>
        )}

        {/* Drag & Drop Context Wrap */}
        <DragDropContext onDragEnd={handleOnDragEnd}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {columns.map((col) => {
              const columnTasks = tasks.filter((t) => t.status === col.key);

              return (
                <div
                  key={col.key}
                  className={`flex flex-col rounded-2xl border ${col.color} bg-zinc-950/60 p-4 min-h-[500px]`}
                >
                  {/* Column Header */}
                  <div className="mb-4 flex items-center justify-between border-b border-zinc-800/80 pb-3">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300">
                      {col.label}
                    </h2>
                    <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-bold text-zinc-400">
                      {columnTasks.length}
                    </span>
                  </div>

                  {/* Droppable Column Body */}
                  <Droppable droppableId={col.key}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex flex-1 flex-col gap-3 rounded-xl transition-colors duration-200 ${
                          snapshot.isDraggingOver
                            ? "bg-indigo-500/5 ring-1 ring-indigo-500/20"
                            : ""
                        }`}
                      >
                        {columnTasks.map((task, index) => {
                          const isAssignedToMe =
                            task.assignedToId === currentUserId;
                          const canEdit = isAdmin || isAssignedToMe;

                          return (
                            <Draggable
                              key={task.id}
                              draggableId={task.id}
                              index={index}
                              isDragDisabled={!canEdit}
                            >
                              {(dragProvided, dragSnapshot) => (
                                <div
                                  ref={dragProvided.innerRef}
                                  {...dragProvided.draggableProps}
                                  {...dragProvided.dragHandleProps}
                                  style={{
                                    ...dragProvided.draggableProps.style,
                                  }}
                                  className={`group relative rounded-xl border border-zinc-800/90 bg-zinc-900/90 p-4 shadow-md transition-all ${
                                    dragSnapshot.isDragging
                                      ? "shadow-2xl shadow-indigo-500/20 border-indigo-500/60 scale-[1.02] z-50"
                                      : "hover:border-zinc-700"
                                  } ${
                                    !canEdit
                                      ? "opacity-75 cursor-not-allowed"
                                      : "cursor-grab active:cursor-grabbing"
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <h3 className="font-semibold text-sm text-white">
                                      {task.title}
                                    </h3>

                                    {isAdmin && (
                                      <button
                                        onClick={() => handleDelete(task.id)}
                                        title="Delete task"
                                        className="text-zinc-500 hover:text-red-400 transition"
                                      >
                                        <svg
                                          className="h-4 w-4"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                          />
                                        </svg>
                                      </button>
                                    )}
                                  </div>

                                  {task.description && (
                                    <p className="mt-1.5 text-xs text-zinc-400 line-clamp-2">
                                      {task.description}
                                    </p>
                                  )}

                                  <div className="mt-4 flex items-center justify-between border-t border-zinc-800/60 pt-3 text-xs">
                                    <span className="text-zinc-500">
                                      Assigned:{" "}
                                      <strong className="text-zinc-300">
                                        {task.assignedTo?.name ||
                                          task.assignedTo?.email}
                                      </strong>
                                    </span>

                                    {!canEdit && (
                                      <span className="text-[10px] italic text-zinc-600">
                                        Locked
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          );
                        })}

                        {provided.placeholder}

                        {columnTasks.length === 0 && (
                          <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-zinc-800/60 p-6 text-center text-xs text-zinc-600">
                            Drop tasks here
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </main>
    </div>
  );
}