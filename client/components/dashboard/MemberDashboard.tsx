'use client';

import { CheckSquare, Clock, AlertTriangle, Loader } from 'lucide-react';
import { StatCard } from './StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, isOverdue, PRIORITY_COLORS, STATUS_COLORS } from '@/lib/utils';
import { Task, Project } from '@/types';
import Link from 'next/link';

interface MemberDashboardProps {
  data: {
    stats: { assignedTasks: number; completedTasks: number; overdueTasks: number; inProgressTasks: number };
    upcomingTasks: Task[];
    myProjects: Project[];
    recentActivity: Array<{ id: string; action: string; createdAt: string }>;
  };
}

export function MemberDashboard({ data }: MemberDashboardProps) {
  if (!data) return null;
  const { stats, upcomingTasks, myProjects } = data;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Assigned Tasks" value={stats.assignedTasks} icon={CheckSquare} color="text-blue-600" bgColor="bg-blue-50" />
        <StatCard title="Completed" value={stats.completedTasks} icon={CheckSquare} color="text-green-600" bgColor="bg-green-50" />
        <StatCard title="In Progress" value={stats.inProgressTasks} icon={Loader} color="text-purple-600" bgColor="bg-purple-50" />
        <StatCard title="Overdue" value={stats.overdueTasks} icon={AlertTriangle} color="text-red-600" bgColor="bg-red-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Tasks */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" /> Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingTasks.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No upcoming tasks</p>
            ) : (
              <div className="space-y-3">
                {upcomingTasks.map((task) => (
                  <Link key={task.id} href={`/tasks`} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors group">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate group-hover:text-blue-600">{task.title}</p>
                      <p className="text-xs text-slate-400">{task.project?.title}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-3 shrink-0">
                      <Badge className={PRIORITY_COLORS[task.priority]}>{task.priority}</Badge>
                      <span className={`text-xs ${isOverdue(task.deadline) ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
                        {formatDate(task.deadline)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Projects */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">My Projects</CardTitle>
          </CardHeader>
          <CardContent>
            {myProjects.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No projects assigned</p>
            ) : (
              <div className="space-y-3">
                {myProjects.map((project) => (
                  <Link key={project.id} href={`/projects/${project.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors group">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate group-hover:text-blue-600">{project.title}</p>
                      <p className="text-xs text-slate-400">{formatDate(project.deadline)}</p>
                    </div>
                    <Badge className={STATUS_COLORS[project.status]}>{project.status.replace('_', ' ')}</Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
