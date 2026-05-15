'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskForm } from '@/components/tasks/TaskForm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { projectService } from '@/services/project.service';
import { taskService } from '@/services/task.service';
import { useAuth } from '@/context/AuthContext';
import { formatDate, STATUS_COLORS, getInitials } from '@/lib/utils';
import { Edit, Trash2, Plus, CheckSquare, Calendar, Users, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectService.getById(id),
  });

  const updateMutation = useMutation({
    mutationFn: (d: Record<string, unknown>) => projectService.update(id, d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['project', id] }); setEditOpen(false); toast.success('Project updated!'); },
    onError: () => toast.error('Failed to update project'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => projectService.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['projects'] }); router.push('/projects'); toast.success('Project deleted'); },
    onError: () => toast.error('Failed to delete project'),
  });

  const createTaskMutation = useMutation({
    mutationFn: taskService.create,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['project', id] }); setTaskOpen(false); toast.success('Task created!'); },
    onError: () => toast.error('Failed to create task'),
  });

  const project = data?.data?.data;

  if (isLoading) return (
    <DashboardLayout title="Project">
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </DashboardLayout>
  );

  if (!project) return (
    <DashboardLayout title="Project">
      <EmptyState icon={CheckSquare} title="Project not found" />
    </DashboardLayout>
  );

  const tasks = project.tasks || [];
  const tasksByStatus = {
    TODO: tasks.filter((t) => t.status === 'TODO'),
    IN_PROGRESS: tasks.filter((t) => t.status === 'IN_PROGRESS'),
    REVIEW: tasks.filter((t) => t.status === 'REVIEW'),
    COMPLETED: tasks.filter((t) => t.status === 'COMPLETED'),
  };

  return (
    <DashboardLayout title={project.title}>
      <div className="space-y-6">
        {/* Back + Actions */}
        <div className="flex items-center justify-between">
          <Link href="/projects" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
            <ArrowLeft className="w-4 h-4" /> Back to Projects
          </Link>
          {isAdmin && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditOpen(true)} className="gap-1">
                <Edit className="w-4 h-4" /> Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={() => { if (confirm('Delete this project?')) deleteMutation.mutate(); }} className="gap-1">
                <Trash2 className="w-4 h-4" /> Delete
              </Button>
            </div>
          )}
        </div>

        {/* Project Header */}
        <div className="bg-white rounded-xl border-0 shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-slate-800">{project.title}</h2>
                <Badge className={STATUS_COLORS[project.status]}>{project.status.replace('_', ' ')}</Badge>
              </div>
              {project.description && <p className="text-slate-500 mb-4">{project.description}</p>}
              <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>Start: {formatDate(project.startDate)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>Deadline: {formatDate(project.deadline)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  <span>{project.members.length} members</span>
                </div>
              </div>
            </div>
            <div className="md:w-48">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-500">Progress</span>
                <span className="font-semibold">{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-2" />
            </div>
          </div>

          {/* Members */}
          <div className="mt-4 pt-4 border-t flex items-center gap-2">
            <span className="text-sm text-slate-500">Team:</span>
            <div className="flex -space-x-2">
              {project.members.map((m) => (
                <Avatar key={m.id} className="h-7 w-7 border-2 border-white" title={m.user.name}>
                  <AvatarImage src={m.user.avatar} />
                  <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">{getInitials(m.user.name)}</AvatarFallback>
                </Avatar>
              ))}
            </div>
          </div>
        </div>

        {/* Tasks */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">Tasks ({tasks.length})</h3>
          {isAdmin && (
            <Button size="sm" onClick={() => setTaskOpen(true)} className="gap-1">
              <Plus className="w-4 h-4" /> Add Task
            </Button>
          )}
        </div>

        <Tabs defaultValue="board">
          <TabsList>
            <TabsTrigger value="board">Board</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
          </TabsList>

          <TabsContent value="board">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              {(['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'] as const).map((status) => (
                <div key={status} className="bg-slate-50 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-slate-600">{status.replace('_', ' ')}</h4>
                    <span className="text-xs bg-white border rounded-full px-2 py-0.5 text-slate-500">{tasksByStatus[status].length}</span>
                  </div>
                  <div className="space-y-2">
                    {tasksByStatus[status].map((task) => (
                      <TaskCard key={task.id} task={task} compact />
                    ))}
                    {tasksByStatus[status].length === 0 && (
                      <p className="text-xs text-slate-400 text-center py-4">No tasks</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="list">
            <div className="space-y-2 mt-4">
              {tasks.length === 0 ? (
                <EmptyState icon={CheckSquare} title="No tasks yet" description="Add tasks to track work in this project." />
              ) : (
                tasks.map((task) => <TaskCard key={task.id} task={task} />)
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Project</DialogTitle></DialogHeader>
          <ProjectForm
            project={project}
            onSubmit={async (d) => { await updateMutation.mutateAsync(d); }}
            loading={updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Task Dialog */}
      <Dialog open={taskOpen} onOpenChange={setTaskOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Create Task</DialogTitle></DialogHeader>
          <TaskForm
            projectId={id}
            members={project.members}
            onSubmit={async (d) => { await createTaskMutation.mutateAsync({ ...d, projectId: id }); }}
            loading={createTaskMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
