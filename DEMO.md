# 🎬 Demo Video Script — Team Task Manager (3 minutes)

---

## Introduction (0:00 – 0:15)

> **[Screen: Browser open to Railway live URL]**

"Hi! This is Team Task Manager — a full-stack web app for managing projects and tasks with
role-based access control. It's built with React, Express, PostgreSQL via Prisma, and
deployed on Railway. Let me walk you through the full user flow."

---

## Scene 1 — Sign Up as ADMIN (0:15 – 0:35)

> **[Screen: /signup page]**

"I'll start by signing up as an Admin. I'll fill in my name, email, password, and select
the Admin role — notice the highlighted toggle. Click 'Create account'."

> **[Action: Fill form, choose Admin role toggle, submit]**
> **[Screen: Redirects to /dashboard]**

"And we're in. The dashboard already shows zeroed-out stats for a fresh account."

---

## Scene 2 — Create a Project (0:35 – 0:55)

> **[Screen: /projects page]**

"Let me create a new project. I'll click 'New Project', enter a name and description in the modal."

> **[Action: Click 'New Project', fill modal, submit]**
> **[Screen: New project card appears in grid]**

"The project card shows member and task counts. Let me open it."

---

## Scene 3 — Sign Up as MEMBER (0:55 – 1:15)

> **[Action: Open new incognito tab → navigate to /signup]**

"In a new incognito window, I'll sign up as a Member."

> **[Action: Fill form, choose Member role, submit]**
> **[Screen: Member dashboard — empty, showing 'No tasks assigned to you']**

"As a member, I can see I have no projects or tasks yet. The navbar shows my Member badge."

---

## Scene 4 — Add Member to Project (1:15 – 1:35)

> **[Action: Switch back to Admin tab → open project detail page]**

"Back in the Admin tab, I'll open the project and click 'Add Member'."

> **[Action: Click 'Add Member', type member's name in search box, click 'Add']**

"The modal has a live search — I can find the member by name or email and add them instantly."

> **[Screen: Member now appears in the Members list]**

---

## Scene 5 — Create and Assign a Task (1:35 – 2:00)

> **[Action: Click '+ New Task' on project detail page → /tasks/new]**

"Now I'll create a task. I'll give it a title, set Priority to HIGH, pick a future due date,
select our project, and assign it to the Member."

> **[Action: Fill form fields, submit]**
> **[Screen: Toast 'Task created!' appears, redirected to /tasks]**

"The task is now visible in the tasks list with an IN_PROGRESS badge."

---

## Scene 6 — Member Views Their Task (2:00 – 2:15)

> **[Action: Switch to Member's incognito tab → /tasks]**

"Switching to the Member tab — they can now see their assigned task. Notice they can't
see other tasks or access admin-only routes."

> **[Action: Click task to open /tasks/:id]**

"The task detail page shows all information, but editing is limited to a Status dropdown only."

---

## Scene 7 — Member Updates Task Status (2:15 – 2:30)

> **[Action: Click 'Edit', change status TODO → IN_PROGRESS → DONE, click 'Save']**

"The Member changes the status from TODO → IN_PROGRESS, saves, then updates again to DONE."

> **[Screen: Toast 'Task updated!', status badge turns green 'Done']**

---

## Scene 8 — Admin Sees Dashboard Update (2:30 – 2:45)

> **[Action: Switch back to Admin tab → navigate to /dashboard]**

"Back in the Admin dashboard, the Done count has increased. The task is no longer
in the 'My Tasks' or 'Recent Activity' sections with a DONE badge."

> **[Screen: Dashboard stat cards show updated numbers]**

---

## Scene 9 — Overdue Task Demonstration (2:45 – 2:55)

> **[Action: Admin creates a new task with yesterday's date — backend will accept since it's an update, or create with a past dueDate if schema allows]**

"To demonstrate overdue detection — any task where the due date is in the past and status
is not DONE gets a red 'Overdue' badge on the dashboard and in the task list."

> **[Screen: Dashboard 'Overdue Tasks' table shows red badge]**

---

## Scene 10 — README and Repo (2:55 – 3:00)

> **[Action: Open GitHub repository → show README.md]**

"Finally, here's the GitHub repository with the full README — local setup instructions,
API documentation table, role access table, and Railway deployment guide."

---

## Closing (3:00)

"That's Team Task Manager — authentication, role-based access, full CRUD, real-time dashboard,
and Railway deployment. Thanks for watching!"

---

> **Production URL:** https://your-app.railway.app  
> **GitHub:** https://github.com/YOUR_USERNAME/team-task-manager
