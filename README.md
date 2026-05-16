# ProjectFlow — Team Task Manager

A production-ready full-stack project management platform similar to Jira/Trello. Built for teams to create projects, assign tasks, manage workflows, and track progress with role-based access control.

🔗 **Live Demo:** [https://wholesome-luck-production-04bd.up.railway.app](https://wholesome-luck-production-04bd.up.railway.app)

---

## Features

- 🔐 **JWT Authentication** — Signup, Login, Logout with bcrypt password hashing
- 👥 **Role-Based Access Control** — Admin and Member roles with middleware enforcement
- 📁 **Project Management** — Create, edit, delete projects with status, progress tracking, deadlines
- ✅ **Task Management** — Kanban board + list view, priorities, deadlines, overdue detection
- 💬 **Comments** — Per-task comment threads
- 👨‍👩‍👧 **Team Management** — Create teams, add/remove members, assign to projects
- 📊 **Dashboards** — Admin analytics with charts, Member dashboard with upcoming tasks
- 📝 **Activity Logs** — Track all actions across the platform
- 📱 **Responsive UI** — Mobile-friendly SaaS dashboard with collapsible sidebar
- 🔔 **Toast Notifications** — Real-time feedback on all actions
- 🦴 **Skeleton Loaders** — Loading states for all data fetching

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| UI Components | Radix UI, shadcn/ui, Lucide Icons |
| State Management | TanStack Query (React Query) |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Backend | Node.js, Express.js 4 |
| Database | PostgreSQL |
| ORM | Prisma 5 |
| Authentication | JWT + bcryptjs |
| Deployment | Railway |

---

## Project Structure

```
├── client/                     # Next.js 14 Frontend
│   ├── app/
│   │   ├── (auth)/             # Login, Signup pages
│   │   └── (dashboard)/        # Dashboard, Projects, Tasks, Teams, Settings
│   ├── components/
│   │   ├── ui/                 # Reusable UI components
│   │   ├── layout/             # Sidebar, Header, DashboardLayout
│   │   ├── dashboard/          # Admin & Member dashboard components
│   │   ├── projects/           # Project card, form
│   │   └── tasks/              # Task card, form
│   ├── context/                # Auth context
│   ├── lib/                    # Axios instance, utilities
│   ├── services/               # API service layer
│   └── types/                  # TypeScript types
│
└── server/                     # Express.js Backend
    ├── src/
    │   ├── controllers/        # Route handlers
    │   ├── routes/             # Express routes
    │   ├── middleware/         # Auth, RBAC, validation, error handling
    │   ├── config/             # Prisma client
    │   └── utils/              # JWT, response helpers, activity logger, seed
    └── prisma/
        └── schema.prisma       # Database schema
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+

### Backend Setup

```bash
cd server
cp .env.example .env
# Fill in your DATABASE_URL and JWT_SECRET
npm install
npx prisma db push
node src/utils/seed.js
npm run dev
```

### Frontend Setup

```bash
cd client
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:5000/api
npm install --legacy-peer-deps
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

### Server (`server/.env`)

```env
DATABASE_URL="postgresql://user:password@localhost:5432/projectmanager"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
CLIENT_URL="http://localhost:3000"
```

### Client (`client/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## API Documentation

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PATCH | `/api/auth/profile` | Update profile |
| PATCH | `/api/auth/change-password` | Change password |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List projects (paginated, filterable) |
| POST | `/api/projects` | Create project (Admin) |
| GET | `/api/projects/:id` | Get project with tasks |
| PATCH | `/api/projects/:id` | Update project (Admin) |
| DELETE | `/api/projects/:id` | Delete project (Admin) |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List tasks (filter by project, status, priority) |
| POST | `/api/tasks` | Create task (Admin) |
| PATCH | `/api/tasks/:id` | Update task (Admin) |
| PATCH | `/api/tasks/:id/status` | Update task status |
| DELETE | `/api/tasks/:id` | Delete task (Admin) |
| POST | `/api/tasks/:id/comments` | Add comment |

### Teams
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/teams` | List teams |
| POST | `/api/teams` | Create team (Admin) |
| POST | `/api/teams/:id/members` | Add member (Admin) |
| DELETE | `/api/teams/:id/members/:userId` | Remove member (Admin) |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/admin` | Admin analytics (Admin only) |
| GET | `/api/dashboard/member` | Member dashboard |

---

## Database Schema

```
Users ──< TeamMembers >── Teams
Users ──< ProjectMembers >── Projects
Projects ──< Tasks
Tasks ──< Comments
Users ──< ActivityLogs
```

---

## Deployment on Railway

### Backend Service
1. Create Railway project → Add PostgreSQL database
2. Add service from GitHub repo → set Root Directory to `server`
3. Set environment variables:
   - `DATABASE_URL` — linked from Railway PostgreSQL
   - `JWT_SECRET` — random secure string
   - `CLIENT_URL` — frontend Railway URL
4. Domain port: **8080**

### Frontend Service
1. Add another service → set Root Directory to `client`
2. Set environment variables:
   - `NEXT_PUBLIC_API_URL` — backend Railway URL + `/api`
3. Domain port: **8080**

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@demo.com | Admin123 |
| Member | member@demo.com | Member123 |

> Run `node src/utils/seed.js` in the server directory to create these accounts.

---

## License

MIT
