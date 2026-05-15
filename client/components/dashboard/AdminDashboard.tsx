'use client';

import { FolderKanban, CheckSquare, Clock, AlertTriangle, Users, UserCheck } from 'lucide-react';
import { StatCard } from './StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, getInitials } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';

const STATUS_COLORS: Record<string, string> = {
  PLANNED: '#94a3b8', ACTIVE: '#3b82f6', COMPLETED: '#22c55e', ON_HOLD: '#f59e0b',
};
const PRIORITY_COLORS: Record<string, string> = {
  LOW: '#22c55e', MEDIUM: '#f59e0b', HIGH: '#f97316', CRITICAL: '#ef4444',
};

interface AdminDashboardProps {
  data: {
    stats: {
      totalProjects: number; totalTasks: number; completedTasks: number;
      pendingTasks: number; overdueTasks: number; totalUsers: number; totalTeams: number;
    };
    recentActivity: Array<{ id: string; action: string; createdAt: string; user?: { name: string; avatar?: string } }>;
    charts: {
      projectsByStatus: Array<{ status: string; _count: { status: number } }>;
      tasksByPriority: Array<{ priority: string; _count: { priority: number } }>;
    };
  };
}

export function AdminDashboard({ data }: AdminDashboardProps) {
  if (!data) return null;
  const { stats, recentActivity, charts } = data;

  const projectChartData = charts.projectsByStatus.map((d) => ({
    name: d.status, value: d._count.status, fill: STATUS_COLORS[d.status] || '#94a3b8',
  }));

  const taskChartData = charts.tasksByPriority.map((d) => ({
    name: d.priority, value: d._count.priority, fill: PRIORITY_COLORS[d.priority] || '#94a3b8',
  }));

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard title="Total Projects" value={stats.totalProjects} icon={FolderKanban} color="text-blue-600" bgColor="bg-blue-50" />
        <StatCard title="Total Tasks" value={stats.totalTasks} icon={CheckSquare} color="text-purple-600" bgColor="bg-purple-50" />
        <StatCard title="Completed" value={stats.completedTasks} icon={UserCheck} color="text-green-600" bgColor="bg-green-50" />
        <StatCard title="Overdue" value={stats.overdueTasks} icon={AlertTriangle} color="text-red-600" bgColor="bg-red-50" />
        <StatCard title="Pending Tasks" value={stats.pendingTasks} icon={Clock} color="text-yellow-600" bgColor="bg-yellow-50" />
        <StatCard title="Team Members" value={stats.totalUsers} icon={Users} color="text-indigo-600" bgColor="bg-indigo-50" />
        <StatCard title="Teams" value={stats.totalTeams} icon={Users} color="text-teal-600" bgColor="bg-teal-50" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Projects by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={projectChartData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {projectChartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Tasks by Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={taskChartData} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {taskChartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No activity yet</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((log) => (
                <div key={log.id} className="flex items-start gap-3">
                  <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                    <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">{getInitials(log.user?.name || 'U')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700">{log.action}</p>
                    <p className="text-xs text-slate-400">{formatDate(log.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
