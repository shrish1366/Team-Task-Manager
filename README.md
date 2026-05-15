# ProjectFlow — Team Project Management Platform

A production-ready full-stack project management application similar to Jira/Trello, built for teams to create projects, assign tasks, manage workflows, and track progress with role-based access control.

## Features

- **Role-Based Access Control** — Admin and Member roles with middleware-enforced permissions
- **Project Management** — Create, edit, delete projects with status tracking and progress calculation
- **Task Management** — Kanban board + list view, priorities, deadlines, overdue detection
- **Team Management** — Create teams, add/remove members, assign to projects
- **Dashboards** — Separate admin (charts, analytics, activity feed) and member dashboards
- **Authentication** — JWT + bcrypt, persistent sessions, protected routes
- **Comments** — Per-task comment threads
- **Activity Logs** — Track all actions across the platform
- **Responsive UI** — Mobile-friendly SaaS dashboard with sidebar navigation

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui |
| State | TanStack Query (React Query), Zustand |
| Backend | Node.js, Express.js |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT + bcryptjs |
| Charts | Recharts |
| Deployment | Railway |

## Project Structure

```
├── client/                 # Next.js frontend
│   ├── app/               # App router pages
│   │   ├── (auth)/        # Login, Signup
│   │   └── (dashboard)/   # Dashboard, Projects, Tasks, Teams, Settings
│   ├── components/        # UI components
│   ├── context/           # Auth context
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Axios, utils
│   ├── services/          # API service layer
│   └── types/             # TypeScript types
│
└── server/                # Express.js backend
    ├── src/
    │   ├── controllers/   # Route handlers
    │   ├── routes/        # Express routes
    │   ├── middleware/     # Auth, RBAC, validation, error handling
    │   ├── config/        # Prisma client
    │   └── utils/         # JWT, response helpers, activity logger
    └── prisma/
        └── schema.prisma  # Database schema
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Backend Setup

```bash
cd server
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET
npm install
npx prisma generate
npx prisma db push        # or: npx prisma migrate dev
npm run dev
```

### Frontend Setup

```bash
cd client
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:5000/api
npm install
npm run dev
```

### Docker (Full Stack)

```bash
docker-compose up --build
```

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
| GET | `/api/projects/:id` | Get project details |
| PATCH | `/api/projects/:id` | Update project (Admin) |
| DELETE | `/api/projects/:id` | Delete project (Admin) |
| POST | `/api/projects/:id/members` | Add member (Admin) |
| DELETE | `/api/projects/:id/members/:userId` | Remove member (Admin) |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List tasks (filterable by project, status, priority) |
| POST | `/api/tasks` | Create task (Admin) |
| GET | `/api/tasks/:id` | Get task details |
| PATCH | `/api/tasks/:id` | Update task (Admin) |
| PATCH | `/api/tasks/:id/status` | Update task status |
| DELETE | `/api/tasks/:id` | Delete task (Admin) |
| POST | `/api/tasks/:id/comments` | Add comment |
| DELETE | `/api/tasks/:id/comments/:commentId` | Delete comment |

### Teams
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/teams` | List teams |
| POST | `/api/teams` | Create team (Admin) |
| GET | `/api/teams/:id` | Get team details |
| PATCH | `/api/teams/:id` | Update team (Admin) |
| DELETE | `/api/teams/:id` | Delete team (Admin) |
| POST | `/api/teams/:id/members` | Add member (Admin) |
| DELETE | `/api/teams/:id/members/:userId` | Remove member (Admin) |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/admin` | Admin analytics (Admin only) |
| GET | `/api/dashboard/member` | Member dashboard |

### Users (Admin only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users |
| GET | `/api/users/:id` | Get user |
| PATCH | `/api/users/:id/role` | Update role |
| DELETE | `/api/users/:id` | Delete user |

## Deployment on Railway

### Backend Service
1. Create a new Railway project
2. Add a PostgreSQL database service
3. Add a new service from your GitHub repo, set root to `/server`
4. Set environment variables:
   - `DATABASE_URL` — from Railway PostgreSQL (auto-linked)
   - `JWT_SECRET` — a strong random string
   - `CLIENT_URL` — your frontend Railway URL
5. Railway auto-runs `npm run db:migrate && npm start`

### Frontend Service
1. Add another service from the same repo, set root to `/client`
2. Set environment variables:
   - `NEXT_PUBLIC_API_URL` — your backend Railway URL + `/api`

## Database Schema

```
Users ──< TeamMembers >── Teams
Users ──< ProjectMembers >── Projects
Projects ──< Tasks
Tasks ──< Comments
Users ──< ActivityLogs
```

## Demo Credentials

After seeding or creating accounts:
- **Admin**: admin@demo.com / Admin123
- **Member**: member@demo.com / Member123

## License

MIT
