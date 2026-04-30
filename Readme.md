# Task Manager

A full-stack task management app built with the MERN stack. It is designed for small teams that want a simple workspace to create projects, invite members, assign work, and track progress without a heavy setup.

The frontend is a React + Vite app, and the backend is an Express API connected to MongoDB. Authentication is handled with JWT, and protected routes keep project and task data scoped to the right users.

## What the app does

This project covers the usual team workflow from account creation to project delivery:

1. A user signs up or logs in.
2. After authentication, they land on a dashboard with project and task stats.
3. They can create projects with a name, description, color, status, and due date.
4. Each project can have team members added by email.
5. Inside a project, tasks can be created, assigned, updated, moved across statuses, and deleted.
6. Each user also gets a personal "My Tasks" view to track their assigned work in one place.

## Main features

- JWT-based signup and login flow
- Protected frontend routes for authenticated users
- Project creation, editing, and deletion
- Team member management inside projects
- Task creation with assignee, priority, status, due date, tags, and comments
- Dashboard summary with recent tasks and status counts
- Kanban and list views for project tasks
- Personal task page with filters, search, and overdue highlights


## Project Demo 

<video controls src="Recording 2026-04-30 202727.mp4" title="Title"></video>
---

## Tech stack

### Frontend

- React
- React Router
- Vite
- Plain CSS

### Backend

- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- bcryptjs
- express-validator

## Project structure

```text
Task-Manager/
|-- backend/
|   |-- controllers/
|   |-- Database/
|   |-- Middleware/
|   |-- models/
|   |-- routes/
|   |-- package.json
|   `-- server.js
|-- forntend/
|   |-- public/
|   |-- src/
|   |   |-- api/
|   |   |-- auth/
|   |   |-- component/
|   |   |-- context/
|   |   |-- page/
|   |   `-- utils/
|   `-- package.json
`-- Readme.md
```

Note: the client folder is currently named `forntend` in the repository, so the commands below use that exact name.

## Application flow

### 1. Authentication

The user signs up or logs in from the frontend. On success, the backend returns a JWT token and basic user details. The token is stored in `localStorage`, and the frontend uses it on future API requests through the shared API helper.

### 2. Session restore

When the app loads, the auth context checks for a saved token and calls `GET /auth/me`. If the token is valid, the user stays logged in. If not, the token is removed and the user is redirected to the login page.

### 3. Dashboard

After login, the app opens the dashboard. This view shows:

- total tasks
- tasks by status
- overdue tasks
- total projects
- recent task activity

### 4. Project management

From the Projects page, a user can:

- create a new project
- open a project detail page
- edit or delete a project they own
- view progress based on completed tasks

Projects are available to the owner and any invited members.

### 5. Team collaboration

Inside a project, admins can invite members using their email address. The owner can also remove members. Access checks on the backend make sure only project members can view the project and its tasks.

### 6. Task workflow

Tasks belong to a project and can include:

- title
- description
- assignee
- status
- priority
- due date
- tags
- comments

Tasks can be updated in board view or list view. Depending on the user's role, they may be allowed to edit everything or only update task status.

### 7. Personal task view

The "My Tasks" page collects all tasks assigned to the current user and supports:

- status filtering
- keyword search
- overdue visibility
- quick completion toggles

## API overview

### Auth routes

- `POST /auth/signup`
- `POST /auth/login`
- `GET /auth/me`
- `PATCH /auth/me`

### Project routes

- `GET /projects`
- `POST /projects`
- `GET /projects/:id`
- `PATCH /projects/:id`
- `DELETE /projects/:id`
- `POST /projects/:id/members`
- `DELETE /projects/:id/members/:userId`
- `PATCH /projects/:id/members/:userId`

### Task routes

- `GET /tasks/my`
- `GET /tasks/stats`
- `GET /projects/:projectId/tasks`
- `POST /projects/:projectId/tasks`
- `PATCH /tasks/:id`
- `DELETE /tasks/:id`
- `POST /tasks/:id/comments`

## Local setup

### Prerequisites

- Node.js
- npm
- MongoDB connection string

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd Task-Manager
```

### 2. Install dependencies

```bash
cd backend
npm install
```

```bash
cd ../forntend
npm install
```

### 3. Create backend environment variables

Create a file at `backend/.env` with the following values:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
```

### 4. Start the backend

```bash
cd backend
npm start
```

The server runs on `http://localhost:5000`.

### 5. Start the frontend

Open a second terminal:

```bash
cd forntend
npm run dev
```

The frontend runs on `http://localhost:5173`.

## Default local configuration

The frontend API helper is currently pointing to:

```text
http://localhost:5000
```

There is also a commented production URL in `forntend/src/api/api.jsx` that can be used when deploying.

## Data model summary

### User

- name
- email
- password
- role
- avatar

### Project

- name
- description
- color
- owner
- members
- status
- dueDate

### Task

- title
- description
- project
- assignee
- createdBy
- status
- priority
- dueDate
- tags
- comments

## A few implementation notes

- Passwords are hashed with `bcryptjs` before saving.
- JWT auth is used for protected API routes.
- MongoDB access is handled through Mongoose models.
- Overdue task detection is computed from task status and due date.
- Project access is limited to owners and invited members.

## Known quirks

- The frontend directory name is `forntend`, not `frontend`.
- CORS in the backend is currently set for `http://localhost:5173`.
- The root README file is named `Readme.md` in this repo.

## Future improvements

- Move the frontend API base URL to environment variables
- Add test coverage for backend controllers and frontend flows
- Add drag-and-drop support for the kanban board
- Add file attachments and richer task comments
- Add deployment instructions for production
