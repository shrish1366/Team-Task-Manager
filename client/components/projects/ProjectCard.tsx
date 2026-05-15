'use client';

import Link from 'next/link';
import { Project } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDate, isOverdue, STATUS_COLORS, getInitials } from '@/lib/utils';
import { Calendar, Users, CheckSquare } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const overdue = isOverdue(project.deadline, project.status);

  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group h-full">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <Badge className={STATUS_COLORS[project.status]}>{project.status.replace('_', ' ')}</Badge>
            {overdue && <Badge className="bg-red-100 text-red-700">Overdue</Badge>}
          </div>

          <h3 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors mb-1 line-clamp-1">
            {project.title}
          </h3>
          {project.description && (
            <p className="text-sm text-slate-500 line-clamp-2 mb-4">{project.description}</p>
          )}

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Progress</span>
                <span>{project.progress ?? 0}%</span>
              </div>
              <Progress value={project.progress ?? 0} className="h-1.5" />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span className={overdue ? 'text-red-500 font-medium' : ''}>{formatDate(project.deadline)}</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckSquare className="w-3.5 h-3.5" />
                <span>{project._count?.tasks ?? 0} tasks</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex -space-x-2">
                {project.members.slice(0, 4).map((m) => (
                  <Avatar key={m.id} className="h-6 w-6 border-2 border-white">
                    <AvatarImage src={m.user.avatar} />
                    <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">{getInitials(m.user.name)}</AvatarFallback>
                  </Avatar>
                ))}
                {project.members.length > 4 && (
                  <div className="h-6 w-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-xs text-slate-500">
                    +{project.members.length - 4}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Users className="w-3.5 h-3.5" />
                <span>{project.members.length}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
