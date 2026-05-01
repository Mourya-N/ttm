# 🚀 Team Task Manager (TTM)

A professional full-stack web application for team collaboration, project management, and task tracking with robust role-based access control.

## 🏗 Project Architecture

```
ttm/
├── frontend/             # React + Vite + Tailwind/Glassmorphism
│   ├── Dockerfile        # Multi-stage Nginx build
│   ├── nginx.conf        # SPA fallback routing
│   ├── railway.toml      # Deployment config
│   └── src/
│       ├── api/api.js    # Axios client with JWT interceptors
│       ├── context/      # Auth state management
│       ├── pages/        # Dashboard, Kanban, Team management
│       └── index.css     # Premium dark-mode design system
└── backend/              # Spring Boot + MongoDB Atlas
    ├── Dockerfile        # Multi-stage Maven + JRE 17 build
    ├── railway.toml      # Deployment config
    └── src/main/java/com/ttm/
        ├── model/        # User, Project, Task entities
        ├── repository/   # MongoDB Data repositories
        ├── service/      # Business logic (RBAC enforced)
        ├── security/     # JWT filter & Stateless config
        └── controller/   # REST API Endpoints
```

## ⚙️ Requirements

- **Java 17+** (Backend)
- **Node.js 20+** (Frontend)
- **MongoDB Atlas** (Cloud Database)

---

## 🔧 Local Development Setup

### 1. Database Setup
- Create a cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
- Whitelist your current IP in **Security -> Network Access**.
- Get your connection string (e.g., `mongodb+srv://user:pass@cluster.mongodb.net/...`).

### 2. Backend Configuration
The backend uses **environment variables** for security. You can set these in your IDE or shell:
- `MONGODB_URI`: Your Atlas connection string.
- `JWT_SECRET`: A long random string (min 32 chars).
- `CORS_ORIGINS`: `http://localhost:5173` (comma-separated for more).

Or edit `backend/src/main/resources/application.properties` directly for local testing.

### 3. Run the App
**Start Backend:**
```bash
cd backend
mvn spring-boot:run
```
**Start Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## 🚂 Railway Deployment (Production)

This project is **pre-configured** for [Railway.app](https://railway.app). 

### Steps to Deploy:
1.  **Push to GitHub**: Create a repository and push this code.
2.  **Create Services**:
    -   **Backend**: Add a new service from your GitHub repo. Set Root Directory to `backend/`.
    -   **Frontend**: Add another service from the same repo. Set Root Directory to `frontend/`.
3.  **Configure Variables** (Railway Tab):
    -   **Backend Variables**:
        -   `MONGODB_URI`: `mongodb+srv://nmourya236:QBmR1qWlCmEjsRtn@cluster0.b50r9lr.mongodb.net/team_task_manager?retryWrites=true&w=majority&appName=Cluster0`
        -   `JWT_SECRET`: `TTM_SuperSecretKey_2024_ChangeInProduction_MustBe256BitsLong`
        -   `CORS_ORIGINS`: `https://your-frontend-domain.up.railway.app,http://localhost:5173`
    -   **Frontend Variables**:
        -   `VITE_API_URL`: `https://your-backend-domain.up.railway.app/api`

*Note: After setting `VITE_API_URL`, you must **Redeploy** the frontend for the changes to take effect.*

---

## 🌐 REST API Summary

| Category | Endpoint | Method | Access |
|---|---|---|---|
| **Auth** | `/api/auth/signup` | POST | Public (First user = Admin) |
| **Auth** | `/api/auth/login` | POST | Public |
| **Projects** | `/api/projects` | GET/POST | Member/Admin |
| **Tasks** | `/api/tasks` | POST | Project Member |
| **Tasks** | `/api/tasks/my` | GET | Assigned User |
| **Team** | `/api/users` | GET | **Admin Only** |
| **Role** | `/api/users/:id/role` | PATCH | **Admin Only** |

---

## 👑 Role-Based Access Control (RBAC)

- **Admin**: Can view all projects/tasks, delete any item, view team list, and change user roles.
- **Member**: Can create projects, view/edit tasks in their projects, and invite others to projects they own.
- **System**: The first user registered in the system is automatically granted the `ADMIN` role.

---

## 🎨 Design Features

- ☀️ **Solaris Blue Theme**: A high-energy professional light mode featuring Blue-to-Orange gradients and a unique right-side sidebar.
- 📋 **Kanban Workflow**: Drag-inspired status columns for Todo, In Progress, In Review, and Done.
- 📊 **Dynamic Dashboard**: Real-time Solaris-themed stats and project velocity tracking.
- 📱 **Fully Responsive**: Optimized for Mobile, Tablet, and Desktop with adaptive sidebar behavior.
- 🚀 **Performance**: Optimized Nginx static serving for the frontend.
