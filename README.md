# 📋 TaskBoard - Kanban Task Management System

TaskBoard is a modern, full-stack Kanban task management application built with **Next.js 16 (App Router)**, **React 19**, **Prisma ORM v7**, **PostgreSQL**, **Tailwind CSS v4**, and **NextAuth / JWT Authentication**.

---

## 🚀 Quick Setup via Automated Script (`setup.sh`)

If you are on Linux or macOS, you can use the included `setup.sh` script to automatically check dependencies, clone the repository, install npm packages, create environment configuration, generate Prisma client, and push the database schema.

### One-Command Setup

Run the following command in your terminal:

```bash
chmod +x setup.sh && ./setup.sh
```

---

## 🛠️ Step-by-Step Manual Setup Guide

If you prefer to set up the project manually step-by-step, follow the guide below.

### Prerequisites

Before starting, ensure you have the following installed on your machine:

- **Node.js**: `v18.0.0` or higher (Recommended: `v20.x`)
- **npm**: `v9.0.0` or higher (bundled with Node.js)
- **Git**: `v2.x` or higher
- **PostgreSQL Database Server**: Running locally or hosted (e.g., Supabase, Neon, Railway, Docker)

---

### Step 1: Clone the Repository

Clone the project repository from GitHub and navigate into the project directory:

```bash
git clone https://github.com/E-4-0-4/tl-taskBoard.git
cd tl-taskBoard/task-board
```

*(Note: If you are already inside the `task-board` directory, skip this step.)*

---

### Step 2: Install Dependencies

Install all required Node.js dependencies:

```bash
npm install
```

---

### Step 3: Configure Environment Variables

Create a `.env` file in the root of the `task-board` project directory:

```bash
cp .env.example .env 2>/dev/null || touch .env
```

Open `.env` in your code editor and configure your database connection string and secret keys:

```env
# Database Connection String
DATABASE_URL="postgresql://postgres:password@localhost:5432/taskboard?schema=public"

# Authentication Secrets
JWT_SECRET="your-jwt-secret-key-here"
AUTH_SECRET="your-super-secret-key-at-least-32-chars-long"
NEXTAUTH_SECRET="your-super-secret-key-at-least-32-chars-long"
```

> ⚠️ **Note**: Make sure to replace `postgres:password@localhost:5432/taskboard` with your actual PostgreSQL user, password, host, port, and database name.

---

### Step 4: Database Setup & Prisma Generation

1. **Push Schema to Database**:
   Create the database tables based on `prisma/schema.prisma`:
   ```bash
   npx prisma db push
   ```

2. **Generate Prisma Client**:
   Generate the custom Prisma Client code:
   ```bash
   npx prisma generate
   ```

---

### Step 5: Seed Initial Database Data (Optional)

Populate the database with sample admin and member user accounts along with initial task cards:

```bash
npx tsx prisma/seed.ts
```

#### 🔑 Pre-configured Seed Accounts

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@taskboard.com` | `password123` |
| **Member** | `sagar@taskboard.com` | `password123` |
| **Member** | `abc@taskboard.com` | `password123` |

---

### Step 6: Start the Development Server

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to access the TaskBoard application.

---

### Step 7: Build for Production (Optional)

To create an optimized production build and start the server:

```bash
# Build the project
npm run build

# Start production server
npm start
```

---

## 📜 Available NPM Scripts

| Script | Command | Description |
| :--- | :--- | :--- |
| **dev** | `npm run dev` | Runs Next.js dev server on port `3000` |
| **build** | `npm run build` | Compiles the Next.js app for production |
| **start** | `npm run start` | Runs the compiled production app |
| **lint** | `npm run lint` | Runs ESLint checks across project files |

---

## 📁 Project Structure

```text
task-board/
├── app/                  # Next.js App Router (pages, API routes, layout)
│   └── generated/prisma  # Generated Prisma Client code
├── lib/                  # Shared utilities, Prisma client instance, auth helpers
├── prisma/
│   ├── schema.prisma     # Prisma data models & DB configuration
│   └── seed.ts           # Database seed script
├── public/               # Static assets & icons
├── .env                  # Environment variables file
├── setup.sh              # Automated setup script
└── README.md             # Project setup guide
```

---

## 🛠️ Troubleshooting

- **PostgreSQL Connection Error (`ECONNREFUSED` / Authentication failed)**:
  - Verify PostgreSQL service is running (`sudo service postgresql status` or `docker ps`).
  - Ensure `DATABASE_URL` in `.env` matches your database username, password, host, and port.
- **Prisma Client Missing Import Error**:
  - Run `npx prisma generate` to rebuild the Prisma client inside `app/generated/prisma`.
