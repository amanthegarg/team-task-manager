# Team Task Manager

## Overview

Team Task Manager is a full-stack web application for managing projects and tasks across teams with role-based access control. Admins can create projects, add members, and manage all tasks, while members can view their assigned work and update task statuses. It features JWT authentication, a real-time dashboard, and is ready for one-click Railway deployment.

---

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React 18 + Vite + Tailwind CSS 3    |
| Backend     | Node.js + Express.js                |
| Database    | PostgreSQL via Prisma ORM           |
| Auth        | JWT (httpOnly cookie)               |
| Validation  | Zod (backend) + custom (frontend)   |
| Rate Limit  | express-rate-limit                  |
| Deployment  | Railway                             |

---

## Features

- **JWT Authentication** — secure httpOnly cookie sessions with auto-restore on refresh
- **Role-Based Access Control** — ADMIN and MEMBER roles with middleware enforcement
- **Projects Module** — create, edit, delete projects; manage member lists
- **Tasks Module** — full CRUD with status/priority/due-date; role-aware editing
- **Dashboard** — real-time stats: total tasks, by status, overdue tasks, recent activity
- **Add Member Modal** — debounced user search with one-click add
- **Overdue Detection** — automatic red badges on tasks past their due date
- **Toast Notifications** — success/error feedback on all async actions
- **Loading Spinners** — every async operation has a visual indicator
- **Responsive UI** — optimized for 375px (mobile) and 1280px (desktop)
- **404 Page** — graceful not-found handling for unknown routes
- **Production Ready** — Express serves the built Vite frontend as static files

---

## Local Setup

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL database (local or cloud, e.g. Railway, Supabase, Neon)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/team-task-manager.git
cd team-task-manager

# 2. Set up the server
cd server
npm install

# 3. Set up the client
cd ../client
npm install

# 4. Configure environment variables (see below)
cd ../server
cp ../.env.example .env
# Edit .env with your actual values

# 5. Run database migrations
npx prisma migrate dev --name init

# 6. Generate Prisma client
npx prisma generate
```

### Environment Variables

Create `server/.env` based on `.env.example`:

| Variable         | Description                                      | Example                                      |
|------------------|--------------------------------------------------|----------------------------------------------|
| `DATABASE_URL`   | PostgreSQL connection string                     | `postgresql://user:pass@host:5432/db`        |
| `JWT_SECRET`     | Long random string for signing JWT tokens        | `abc123...` (64+ chars)                      |
| `JWT_EXPIRES_IN` | JWT token expiry duration                        | `7d`                                         |
| `NODE_ENV`       | Environment mode                                 | `development` or `production`                |
| `PORT`           | Express server port (Railway sets automatically) | `5000`                                       |
| `CLIENT_ORIGIN`  | Frontend origin for CORS (development only)      | `http://localhost:5173`                      |

### Running the App

**Development (two terminals):**

```bash
# Terminal 1 — Start the backend
cd server
npm run dev

# Terminal 2 — Start the frontend
cd client
npm run dev
```

Frontend: http://localhost:5173  
Backend API: http://localhost:5000/api

---

## API Documentation

### Auth Routes (`/api/auth/*`)

| Method | Endpoint          | Auth     | Body                              | Response                    |
|--------|-------------------|----------|-----------------------------------|-----------------------------|
| POST   | `/auth/signup`    | None     | `{name, email, password, role}`   | `{user}` + sets cookie      |
| POST   | `/auth/login`     | None     | `{email, password}`               | `{user}` + sets cookie      |
| POST   | `/auth/logout`    | None     | —                                 | `{message}`                 |
| GET    | `/auth/me`        | JWT      | —                                 | `{user}`                    |

### Projects Routes (`/api/projects/*`)

| Method | Endpoint                        | Auth         | Body                     | Response                  |
|--------|---------------------------------|--------------|--------------------------|---------------------------|
| POST   | `/projects`                     | ADMIN        | `{name, description?}`   | `{project}`               |
| GET    | `/projects`                     | JWT          | —                        | `{projects[]}`            |
| GET    | `/projects/:id`                 | JWT          | —                        | `{project}` with tasks    |
| PUT    | `/projects/:id`                 | ADMIN        | `{name?, description?}`  | `{project}`               |
| DELETE | `/projects/:id`                 | ADMIN        | —                        | `{message}`               |
| POST   | `/projects/:id/members`         | ADMIN        | `{userId}`               | `{membership}`            |
| DELETE | `/projects/:id/members/:userId` | ADMIN        | —                        | `{message}`               |

### Tasks Routes (`/api/tasks/*`)

| Method | Endpoint      | Auth            | Body                                                              | Response      |
|--------|---------------|-----------------|-------------------------------------------------------------------|---------------|
| POST   | `/tasks`      | ADMIN           | `{title, projectId, status?, priority?, dueDate?, assignedTo?}`  | `{task}`      |
| GET    | `/tasks`      | JWT             | Query: `status`, `priority`, `overdue`                            | `{tasks[]}`   |
| GET    | `/tasks/:id`  | JWT             | —                                                                 | `{task}`      |
| PUT    | `/tasks/:id`  | JWT (role-aware)| ADMIN: all fields. MEMBER: `{status}` only                        | `{task}`      |
| DELETE | `/tasks/:id`  | ADMIN           | —                                                                 | `{message}`   |

### Dashboard Route

| Method | Endpoint       | Auth | Response                                                      |
|--------|----------------|------|---------------------------------------------------------------|
| GET    | `/dashboard`   | JWT  | `{totalTasks, byStatus, overdueTasks[], myTasks[], recentActivity[]}` |

### Users Route

| Method | Endpoint     | Auth  | Query           | Response      |
|--------|--------------|-------|-----------------|---------------|
| GET    | `/users`     | ADMIN | `search` (name/email) | `{users[]}` |

---

## Role-Based Access

| Action                       | ADMIN | MEMBER          |
|------------------------------|-------|-----------------|
| Create project               | ✅    | ❌              |
| Edit / delete project        | ✅    | ❌              |
| View projects                | All   | Only assigned   |
| Add / remove project members | ✅    | ❌              |
| Create task                  | ✅    | ❌              |
| View tasks                   | All   | Only assigned   |
| Update task (all fields)     | ✅    | ❌              |
| Update task status only      | ✅    | ✅ (own tasks)  |
| Delete task                  | ✅    | ❌              |
| View dashboard               | All   | Own data only   |

---

## Deployment (Railway)

### Step 1 — Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/team-task-manager.git
git push -u origin main
```

### Step 2 — Create Railway Project
1. Go to [railway.app](https://railway.app) and create a new project
2. Click **"Deploy from GitHub repo"** → select your repository

### Step 3 — Add PostgreSQL
1. In your Railway project, click **"+ New"** → **"Database"** → **"PostgreSQL"**
2. Railway will automatically inject `DATABASE_URL` into your service

### Step 4 — Configure Service Settings
In your Railway service → **Settings**:
- **Root Directory**: `server`
- **Build Command**: `npm run build`
- **Start Command**: `npm start`

### Step 5 — Set Environment Variables
In your service → **Variables**, add:

```
JWT_SECRET=<your-64-char-random-secret>
JWT_EXPIRES_IN=7d
NODE_ENV=production
```

> `DATABASE_URL` and `PORT` are set automatically by Railway.

### Step 6 — Deploy
Railway will build the frontend (`npm run build` in `/client`) and start the Express server which serves both the API and the built frontend.

---

## Screenshots

> Add screenshots here

---

## Live URL

> https://your-app.railway.app
