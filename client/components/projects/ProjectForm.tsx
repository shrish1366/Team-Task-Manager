'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { teamService } from '@/services/team.service';
import { userService } from '@/services/user.service';
import { Project } from '@/types';

const schema = z.object({
  title: z.string().min(1, 'Title required'),
  description: z.string().optional(),
  status: z.enum(['PLANNED', 'ACTIVE', 'COMPLETED', 'ON_HOLD']),
  startDate: z.string().optional(),
  deadline: z.string().optional(),
  teamId: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface ProjectFormProps {
  project?: Project;
  onSubmit: (data: FormData & { memberIds?: string[] }) => Promise<void>;
  loading?: boolean;
}

export function ProjectForm({ project, onSubmit, loading }: ProjectFormProps) {
  const [selectedMembers, setSelectedMembers] = useState<string[]>(
    project?.members.map((m) => m.userId) || []
  );

  const { data: teamsData } = useQuery({ queryKey: ['teams-list'], queryFn: () => teamService.getAll({ limit: 100 }) });
  const { data: usersData } = useQuery({ queryKey: ['users-list'], queryFn: () => userService.getAll({ limit: 100 }) });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: project?.title || '',
      description: project?.description || '',
      status: project?.status || 'PLANNED',
      startDate: project?.startDate ? project.startDate.split('T')[0] : '',
      deadline: project?.deadline ? project.deadline.split('T')[0] : '',
      teamId: project?.teamId || '',
    },
  });

  const teams = teamsData?.data?.data?.teams || [];
  const users = usersData?.data?.data?.users || [];

  const toggleMember = (userId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleFormSubmit = async (data: FormData) => {
    await onSubmit({ ...data, memberIds: selectedMembers });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Title *</Label>
        <Input placeholder="Project title" {...register('title')} />
        {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea placeholder="Project description..." rows={3} {...register('description')} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={watch('status')} onValueChange={(v) => setValue('status', v as FormData['status'])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {['PLANNED', 'ACTIVE', 'COMPLETED', 'ON_HOLD'].map((s) => (
                <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Team</Label>
          <Select value={watch('teamId') || 'none'} onValueChange={(v) => setValue('teamId', v === 'none' ? '' : v)}>
            <SelectTrigger><SelectValue placeholder="Select team" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No team</SelectItem>
              {teams.map((t: { id: string; name: string }) => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start Date</Label>
          <Input type="date" {...register('startDate')} />
        </div>
        <div className="space-y-2">
          <Label>Deadline</Label>
          <Input type="date" {...register('deadline')} />
        </div>
      </div>

      {!project && (
        <div className="space-y-2">
          <Label>Add Members</Label>
          <div className="max-h-36 overflow-y-auto border rounded-md p-2 space-y-1">
            {users.map((u: { id: string; name: string; email: string }) => (
              <label key={u.id} className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedMembers.includes(u.id)}
                  onChange={() => toggleMember(u.id)}
                  className="rounded"
                />
                <span className="text-sm">{u.name}</span>
                <span className="text-xs text-slate-400">{u.email}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
      </Button>
    </form>
  );
}
