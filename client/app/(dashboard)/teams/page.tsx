'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { teamService } from '@/services/team.service';
import { userService } from '@/services/user.service';
import { useAuth } from '@/context/AuthContext';
import { getInitials, formatDate } from '@/lib/utils';
import { Plus, Users, Trash2, UserPlus, UserMinus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Team } from '@/types';
import Link from 'next/link';

export default function TeamsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ['teams', search],
    queryFn: () => teamService.getAll({ search }),
  });

  const { data: usersData } = useQuery({
    queryKey: ['users-list'],
    queryFn: () => userService.getAll({ limit: 100 }),
    enabled: isAdmin,
  });

  const createMutation = useMutation({
    mutationFn: teamService.create,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['teams'] }); setOpen(false); setName(''); setDescription(''); setSelectedMembers([]); toast.success('Team created!'); },
    onError: () => toast.error('Failed to create team'),
  });

  const deleteMutation = useMutation({
    mutationFn: teamService.delete,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['teams'] }); toast.success('Team deleted'); },
    onError: () => toast.error('Failed to delete team'),
  });

  const teams: Team[] = data?.data?.data?.teams || [];
  const users = usersData?.data?.data?.users || [];

  const handleCreate = async () => {
    if (!name.trim()) return toast.error('Team name required');
    await createMutation.mutateAsync({ name, description, memberIds: selectedMembers });
  };

  return (
    <DashboardLayout title="Teams">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Search teams..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          {isAdmin && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 shrink-0"><Plus className="w-4 h-4" /> New Team</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader><DialogTitle>Create Team</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Team Name *</Label>
                    <Input placeholder="Engineering, Design..." value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea placeholder="What does this team do?" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Add Members</Label>
                    <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-1">
                      {users.map((u: { id: string; name: string; email: string }) => (
                        <label key={u.id} className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer">
                          <input type="checkbox" checked={selectedMembers.includes(u.id)} onChange={() => setSelectedMembers(prev => prev.includes(u.id) ? prev.filter(id => id !== u.id) : [...prev, u.id])} className="rounded" />
                          <span className="text-sm">{u.name}</span>
                          <span className="text-xs text-slate-400">{u.email}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <Button className="w-full" onClick={handleCreate} disabled={createMutation.isPending}>
                    {createMutation.isPending ? 'Creating...' : 'Create Team'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
          </div>
        ) : teams.length === 0 ? (
          <EmptyState icon={Users} title="No teams found" description={isAdmin ? 'Create your first team.' : 'You are not part of any team yet.'} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((team) => (
              <Card key={team.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{team.name}</CardTitle>
                      {team.description && <p className="text-sm text-slate-500 mt-1 line-clamp-2">{team.description}</p>}
                    </div>
                    {isAdmin && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500" onClick={() => { if (confirm('Delete team?')) deleteMutation.mutate(team.id); }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex -space-x-2">
                      {team.members.slice(0, 5).map((m) => (
                        <Avatar key={m.id} className="h-7 w-7 border-2 border-white" title={m.user.name}>
                          <AvatarImage src={m.user.avatar} />
                          <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">{getInitials(m.user.name)}</AvatarFallback>
                        </Avatar>
                      ))}
                      {team.members.length > 5 && (
                        <div className="h-7 w-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-xs text-slate-500">+{team.members.length - 5}</div>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">{team.members.length} member{team.members.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">{team._count?.projects ?? 0} project{(team._count?.projects ?? 0) !== 1 ? 's' : ''}</span>
                    <Link href={`/teams/${team.id}`}>
                      <Button variant="outline" size="sm" className="h-7 text-xs">View</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
