export type Role = 'ADMIN' | 'MEMBER';
export type ProjectStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'ON_HOLD';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  members: TeamMember[];
  _count?: { projects: number };
  createdAt: string;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  user: Pick<User, 'id' | 'name' | 'email' | 'avatar'>;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  status: ProjectStatus;
  startDate?: string;
  deadline?: string;
  createdById: string;
  teamId?: string;
  creator: Pick<User, 'id' | 'name'>;
  team?: Pick<Team, 'id' | 'name'>;
  members: ProjectMember[];
  tasks?: Task[];
  progress?: number;
  _count?: { tasks: number };
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  user: Pick<User, 'id' | 'name' | 'email' | 'avatar'>;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  deadline?: string;
  projectId: string;
  assignedToId?: string;
  createdById: string;
  assignedTo?: Pick<User, 'id' | 'name' | 'avatar'>;
  createdBy: Pick<User, 'id' | 'name'>;
  project?: Pick<Project, 'id' | 'title'>;
  comments?: Comment[];
  _count?: { comments: number };
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  taskId: string;
  userId: string;
  user: Pick<User, 'id' | 'name' | 'avatar'>;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  user?: Pick<User, 'id' | 'name' | 'avatar'>;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
