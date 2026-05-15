'use client';

import { useState } from 'react';
import { Task } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDate, isOverdue, PRIORITY_COLORS, STATUS_COLORS, getInitials } from '@/lib/utils';
import { Calendar, MessageSquare, AlertCircle } from 'lucide-react';
import { taskService } from '@/services/task.service';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  compact?: boolean;
  onUpdate?: () => void;
}

export function TaskCard({ task, compact, onUpdate }: TaskCardProps) {
  const queryClient = useQueryClient();
  const [updating, setUpdating] = useState(false);
  const overdue = isOverdue(task.deadline, task.status);

  const handleStatusChange = async (status: string) => {
    setUpdating(true);
    try {
      await taskService.updateStatus(task.id, status);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['project'] });
      onUpdate?.();
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (compact) {
    return (
      <Card className="border shadow-none hover:shadow-sm transition-shadow">
        <CardContent className="p-3">
          <p className="text-sm font-medium text-slate-700 line-clamp-2 mb-2">{task.title}</p>
          <div className="flex items-center justify-between">
            <Badge className={cn('text-xs', PRIORITY_COLORS[task.priority])}>{task.priority}</Badge>
            {task.assignedTo && (
              <Avatar className="h-5 w-5">
                <AvatarImage src={task.assignedTo.avatar} />
                <AvatarFallback className="text-xs bg-blue-100 text-blue-700">{getInitials(task.assignedTo.name)}</AvatarFallback>
              </Avatar>
            )}
          </div>
          {task.deadline && (
            <div className={cn('flex items-center gap-1 mt-2 text-xs', overdue ? 'text-red-500' : 'text-slate-400')}>
              <Calendar className="w-3 h-3" />
              {formatDate(task.deadline)}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {overdue && <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />}
              <h4 className="font-medium text-slate-800 truncate">{task.title}</h4>
            </div>
            {task.description && <p className="text-sm text-slate-500 line-clamp-2 mb-2">{task.description}</p>}
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={PRIORITY_COLORS[task.priority]}>{task.priority}</Badge>
              {task.project && <span className="text-xs text-slate-400">{task.project.title}</span>}
              {task.deadline && (
                <div className={cn('flex items-center gap-1 text-xs', overdue ? 'text-red-500 font-medium' : 'text-slate-400')}>
                  <Calendar className="w-3 h-3" />
                  {formatDate(task.deadline)}
                </div>
              )}
              {(task._count?.comments ?? 0) > 0 && (
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <MessageSquare className="w-3 h-3" />
                  {task._count?.comments}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {task.assignedTo && (
              <Avatar className="h-7 w-7" title={task.assignedTo.name}>
                <AvatarImage src={task.assignedTo.avatar} />
                <AvatarFallback className="text-xs bg-blue-100 text-blue-700">{getInitials(task.assignedTo.name)}</AvatarFallback>
              </Avatar>
            )}
            <Select value={task.status} onValueChange={handleStatusChange} disabled={updating}>
              <SelectTrigger className={cn('h-8 w-32 text-xs', STATUS_COLORS[task.status])}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'].map((s) => (
                  <SelectItem key={s} value={s} className="text-xs">{s.replace('_', ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
