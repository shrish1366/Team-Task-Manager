'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { teamService } from '@/services/team.service';
import { userService } from '@/services/user.service';
import { useAuth } from '@/context/AuthContext';
import { getInitials, STATUS_COLORS, formatDate } from '@/lib/utils';
import { UserMinus, UserPlus, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function TeamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const queryClient = useQueryClient();
  const [addUserId, setAddUserId] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['team', id],
    queryFn: () => teamService.getById(id),
  });

  const { data: usersData } = useQuery({
    queryKey: ['users-list'],
    queryFn: () => userService.getAll({ limit: 100 }),
    enabled: isAdmin,
  });

  const addMutation = useMutation({
    mutationFn: (userId: string) => teamService.addMember(id, userId),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['team', id] }); setAddUserId(''); toast.success('Member added'); },
    onError: (err: unknown) => toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to add member'),
  });

  const removeMutation = useMutation({
    mutationFn: (userId: string) => teamService.removeMember(id, userId),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['team', id] }); toast.success('Member removed'); },
    onError: () => toast.error('Failed to remove member'),
  });

  const team = data?.data?.data;
  const allUsers = usersData?.data?.data?.users || [];
  const memberIds = team?.members.map((m: { userId: string }) => m.userId) || [];
  const nonMembers = allUsers.filter((u: { id: string }) => !memberIds.includes(u.id));

  if (isLoading) return (
    <DashboardLayout title="Team">
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </DashboardLayout>
  );

  if (!team) return <DashboardLayout title="Team"><p className="text-slate-500">Team not found</p></DashboardLayout>;

  return (
    <DashboardLayout title={team.name}>
      <div className="space-y-6">
        <Link href="/teams" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft className="w-4 h-4" /> Back to Teams
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Members */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Members ({team.members.length})</CardTitle>
                  {isAdmin && (
                    <div className="flex gap-2">
                      <Select value={addUserId || 'none'} onValueChange={(v) => setAddUserId(v === 'none' ? '' : v)}>
                        <SelectTrigger className="w-44 h-8 text-sm"><SelectValue placeholder="Add member..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Select user</SelectItem>
                          {nonMembers.map((u: { id: string; name: string }) => (
                            <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button size="sm" className="h-8 gap-1" disabled={!addUserId || addMutation.isPending} onClick={() => addUserId && addMutation.mutate(addUserId)}>
                        <UserPlus className="w-3.5 h-3.5" /> Add
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {team.members.map((m: { id: string; userId: string; user: { id: string; name: string; email: string; role: string; avatar?: string } }) => (
                    <div key={m.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-blue-100 text-blue-700 text-sm">{getInitials(m.user.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{m.user.name}</p>
                          <p className="text-xs text-slate-400">{m.user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{m.user.role}</Badge>
                        {isAdmin && m.userId !== user?.id && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-red-500" onClick={() => removeMutation.mutate(m.userId)}>
                            <UserMinus className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Projects */}
          <div>
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Projects ({team.projects?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                {(team.projects || []).length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">No projects</p>
                ) : (
                  <div className="space-y-2">
                    {team.projects.map((p: { id: string; title: string; status: string; deadline?: string }) => (
                      <Link key={p.id} href={`/projects/${p.id}`} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 group">
                        <span className="text-sm font-medium group-hover:text-blue-600 truncate">{p.title}</span>
                        <Badge className={STATUS_COLORS[p.status]}>{p.status.replace('_', ' ')}</Badge>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
