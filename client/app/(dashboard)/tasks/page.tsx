'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskForm } from '@/components/tasks/TaskForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';
import { taskService } from '@/services/task.service';
import { projectService } from '@/services/project.service';
import { useAuth } from '@/context/AuthContext';
import { Plus, CheckSquare, Search, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery as useQ } from '@tanstack/react-query';

export default function TasksPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [overdue, setOverdue] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['tasks', search, status, priority, overdue, page],
    queryFn: () => taskService.getAll({ search, status, priority, overdue, page, limit: 20 }),
  });

  const { data: projectsData } = useQ({
    queryKey: ['projects-list'],
    queryFn: () => projectService.getAll({ limit: 100 }),
    enabled: isAdmin,
  });

  const projects = projectsData?.data?.data?.projects || [];
  const selectedProject = projects.find((p: { id: string }) => p.id === selectedProjectId);

  const createMutation = useMutation({
    mutationFn: taskService.create,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tasks'] }); setOpen(false); toast.success('Task created!'); },
    onError: () => toast.error('Failed to create task'),
  });

  const tasks = data?.data?.data?.tasks || [];
  const total = data?.data?.data?.total || 0;
  const totalPages = Math.ceil(total / 20);

  return (
    <DashboardLayout title="Tasks">
      <div className="space-y-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-2 flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9 w-48"
              />
            </div>
            <Select value={status || 'all'} onValueChange={(v) => { setStatus(v === 'all' ? '' : v); setPage(1); }}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'].map((s) => (
                  <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priority || 'all'} onValueChange={(v) => { setPriority(v === 'all' ? '' : v); setPage(1); }}>
              <SelectTrigger className="w-32"><SelectValue placeholder="Priority" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant={overdue ? 'destructive' : 'outline'}
              size="sm"
              onClick={() => setOverdue(!overdue)}
              className="gap-1"
            >
              <AlertTriangle className="w-3.5 h-3.5" /> Overdue
            </Button>
          </div>

          {isAdmin && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 shrink-0"><Plus className="w-4 h-4" /> New Task</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Create Task</DialogTitle></DialogHeader>
                <div className="mb-4">
                  <Select value={selectedProjectId || 'none'} onValueChange={(v) => setSelectedProjectId(v === 'none' ? '' : v)}>
                    <SelectTrigger><SelectValue placeholder="Select project *" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Select project</SelectItem>
                      {projects.map((p: { id: string; title: string }) => (
                        <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedProjectId && (
                  <TaskForm
                    projectId={selectedProjectId}
                    members={selectedProject?.members || []}
                    onSubmit={async (d) => { await createMutation.mutateAsync({ ...d, projectId: selectedProjectId }); }}
                    loading={createMutation.isPending}
                  />
                )}
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Task count */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">{total} task{total !== 1 ? 's' : ''}</span>
          {overdue && <Badge className="bg-red-100 text-red-700">Overdue filter active</Badge>}
        </div>

        {/* List */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
          </div>
        ) : tasks.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title="No tasks found"
            description={isAdmin ? 'Create tasks within a project.' : 'No tasks assigned to you yet.'}
          />
        ) : (
          <>
            <div className="space-y-3">
              {tasks.map((task) => <TaskCard key={task.id} task={task} />)}
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 pt-4">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                <span className="flex items-center text-sm text-slate-500 px-3">Page {page} of {totalPages}</span>
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
