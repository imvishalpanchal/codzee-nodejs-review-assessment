# TaskFlow API - Codzee Code Review Assessment

> A modern, robust RESTful API built with **Node.js**, **Express**, **Prisma ORM**, and **SQLite**, designed to evaluate and test **Codzee AI Code Reviewer** capabilities.

---

## 📌 Project Overview
TaskFlow API is a clean, multi-tenant task and project management service designed to provide a real-world code environment for exploring automated PR code reviews, architectural feedback, vulnerability detection, and edge-case handling.

### Tech Stack
- **Runtime & Framework:** Node.js (v22+) & Express.js
- **Database & ORM:** SQLite & Prisma ORM
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs
- **Validation:** Yup schema validation middleware
- **Architecture:** Layered Controller-Service-Repository pattern with centralized error and response handlers

---

## 📂 Project Structure
```
codzee-nodejs-review-assessment/
├── prisma/
│   ├── schema.prisma       # Prisma schema (User, Project, Task models)
│   └── seed.js             # Seed script with default users and demo projects
├── src/
│   ├── config/
│   │   ├── api/
│   │   │   ├── errorHandler.js   # Standardized ApiError factory
│   │   │   └── sendResponse.js   # Consistent ApiResponse envelope
│   │   └── database/
│   │       └── prismaClient.js   # Singleton Prisma client instance
│   ├── controllers/
│   │   ├── auth.js               # Registration, Login, Profile
│   │   ├── projects.js           # Project management controller
│   │   └── tasks.js              # Task management controller
│   ├── middlewares/
│   │   ├── auth.js               # JWT authentication & role-based guard
│   │   └── errorHandler.js       # Global error handling middleware
│   ├── routes/
│   │   ├── auth.js               # /api/v1/auth routes
│   │   ├── projects.js           # /api/v1/projects routes
│   │   └── tasks.js              # /api/v1/tasks routes
│   ├── services/
│   │   ├── projects.js           # Business logic & DB queries for projects
│   │   └── tasks.js              # Business logic & DB queries for tasks
│   ├── utils/
│   │   ├── constants.js          # Status, priorities, and roles constants
│   │   ├── messages.js           # Localized response & validation messages
│   │   └── yup.js                # Yup validation wrapper
│   ├── validations/
│   │   ├── auth.js               # Schemas for login & registration
│   │   ├── common.js             # Reusable validation primitives
│   │   ├── projects.js           # Project validation schemas
│   │   └── tasks.js              # Task validation schemas
│   └── server.js                 # Express application & server entrypoint
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### 1. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Database Migration & Seeding
Push the schema to SQLite and run the seed script:
```bash
npx prisma db push
npm run db:seed
```

### 4. Running the Server
```bash
# Development mode with Nodemon:
npm run dev

# Production mode:
npm start
```
The server will start at `http://localhost:5000`.

---

## 🔑 Default Credentials (from Seed)
| Role   | Email | Password |
|--------|-------|----------|
| **Admin** | `admin@codzee-review.dev` | `Admin@123456` |
| **Member** | `member@codzee-review.dev` | `Member@123456` |

---

## 📡 API Endpoints Reference

### Health Check
- `GET /health` - Server liveness status check

### Authentication (`/api/v1/auth`)
- `POST /api/v1/auth/register` - Create a new user account
- `POST /api/v1/auth/login` - Authenticate and receive JWT token
- `GET /api/v1/auth/me` - Get current user profile (Requires Bearer token)

### Projects (`/api/v1/projects`)
- `GET /api/v1/projects` - List projects (Paginated, filtered)
- `GET /api/v1/projects/:id` - Get project details with associated tasks
- `POST /api/v1/projects` - Create a new project
- `PUT /api/v1/projects/:id` - Update project details
- `DELETE /api/v1/projects/:id` - Delete project (Cascades tasks)

### Tasks (`/api/v1/tasks`)
- `GET /api/v1/tasks` - List tasks (Filtered by project, status, priority, assignee)
- `GET /api/v1/tasks/:id` - Get task details
- `POST /api/v1/tasks` - Create a new task in a project
- `PUT /api/v1/tasks/:id` - Update task details or status
- `DELETE /api/v1/tasks/:id` - Remove a task

---

## 🧪 Codzee Review Evaluation Strategy
This repository is configured for assessing **Codzee.io** AI code reviews across 3 distinct Pull Requests:

1. **PR 1: Feature Addition & Domain Logic**
   - *Scope:* Introduce Task Comments & Audit Timeline (`Comment` model, migration, routes, validations).
   - *Codzee Review Target:* Evaluates API design, relational schema, authorization checks, and data modeling.

2. **PR 2: Security, Performance & Rate Limiting**
   - *Scope:* Implement IP/User rate limiting, sanitized SQL/input checks, and enhanced token expiry management.
   - *Codzee Review Target:* Evaluates security vulnerabilities detection, DOS prevention, and defensive coding.

3. **PR 3: Bug Fix & Automated Test Suite**
   - *Scope:* Resolve task state transition bugs and introduce an automated Jest/Supertest integration test suite.
   - *Codzee Review Target:* Evaluates regression detection, test assertion validity, and edge-case spotting.