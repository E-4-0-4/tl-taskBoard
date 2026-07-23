"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TaskboardLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login / perform authentication
    console.log("Taskboard Login:", { email, password });
    
    // Example redirect after authentication
    setTimeout(() => {
      setIsLoading(false);
      router.push("/dashboard");
    }, 1000);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-zinc-900 px-4 font-sans text-zinc-100 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/20 blur-[120px]" />
      <div className="absolute bottom-1/4 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 translate-y-1/2 rounded-full bg-violet-500/15 blur-[120px]" />

      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/80 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
        {/* Brand Header */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/30">
            {/* Taskboard Logo Icon */}
            <svg
              className="h-6 w-6 text-white"
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
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Taskboard
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Sign in to manage your workspace & tasks
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold uppercase tracking-wider text-zinc-400"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@taskboard.com"
              className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-900/90 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 shadow-inner transition duration-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-zinc-400"
              >
                Password
              </label>
              <a
                href="#"
                className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline"
              >
                Forgot?
              </a>
            </div>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-900/90 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 shadow-inner transition duration-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition duration-200 hover:opacity-95 active:scale-[0.99] disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Signing in...
              </span>
            ) : (
              "Sign In to Taskboard"
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-zinc-500">
          Don&apos;t have an account?{" "}
          <a href="#" className="font-medium text-indigo-400 hover:underline">
            Request access
          </a>
        </p>
      </div>
    </div>
  );
}