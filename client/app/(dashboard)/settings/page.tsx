'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { authService } from '@/services/auth.service';
import { userService } from '@/services/user.service';
import { useAuth } from '@/context/AuthContext';
import { getInitials } from '@/lib/utils';
import { toast } from 'sonner';
import { User, Trash2, Shield } from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  avatar: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Required'),
  newPassword: z.string().min(8).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

type ProfileData = z.infer<typeof profileSchema>;
type PasswordData = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const queryClient = useQueryClient();

  const { register: regProfile, handleSubmit: handleProfile, formState: { errors: profileErrors } } = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || '', avatar: user?.avatar || '' },
  });

  const { register: regPwd, handleSubmit: handlePwd, reset: resetPwd, formState: { errors: pwdErrors } } = useForm<PasswordData>({
    resolver: zodResolver(passwordSchema),
  });

  const profileMutation = useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: (res) => { updateUser(res.data.data); toast.success('Profile updated!'); },
    onError: () => toast.error('Failed to update profile'),
  });

  const passwordMutation = useMutation({
    mutationFn: authService.changePassword,
    onSuccess: () => { resetPwd(); toast.success('Password changed!'); },
    onError: (err: unknown) => toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to change password'),
  });

  // Admin: user management
  const { data: usersData } = useQuery({
    queryKey: ['users-admin'],
    queryFn: () => userService.getAll({ limit: 50 }),
    enabled: isAdmin,
  });

  const deleteUserMutation = useMutation({
    mutationFn: userService.delete,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users-admin'] }); toast.success('User deleted'); },
    onError: () => toast.error('Failed to delete user'),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => userService.updateRole(id, role),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users-admin'] }); toast.success('Role updated'); },
    onError: () => toast.error('Failed to update role'),
  });

  const users = usersData?.data?.data?.users || [];

  return (
    <DashboardLayout title="Settings">
      <div className="max-w-3xl space-y-6">
        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            {isAdmin && <TabsTrigger value="users">User Management</TabsTrigger>}
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="border-0 shadow-sm">
              <CardHeader><CardTitle className="text-base">Profile Settings</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-6">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="bg-blue-600 text-white text-xl">{getInitials(user?.name || 'U')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-slate-800">{user?.name}</p>
                    <p className="text-sm text-slate-500">{user?.email}</p>
                    <Badge variant="outline" className="mt-1 text-xs">{user?.role}</Badge>
                  </div>
                </div>
                <Separator className="mb-6" />
                <form onSubmit={handleProfile(async (d) => profileMutation.mutate(d))} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input {...regProfile('name')} />
                    {profileErrors.name && <p className="text-xs text-red-500">{profileErrors.name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Avatar URL</Label>
                    <Input placeholder="https://..." {...regProfile('avatar')} />
                    {profileErrors.avatar && <p className="text-xs text-red-500">{profileErrors.avatar.message}</p>}
                  </div>
                  <Button type="submit" disabled={profileMutation.isPending}>
                    {profileMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card className="border-0 shadow-sm">
              <CardHeader><CardTitle className="text-base">Change Password</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handlePwd(async (d) => passwordMutation.mutate(d))} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Current Password</Label>
                    <Input type="password" {...regPwd('currentPassword')} />
                    {pwdErrors.currentPassword && <p className="text-xs text-red-500">{pwdErrors.currentPassword.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input type="password" placeholder="Min 8 chars, upper, lower, number" {...regPwd('newPassword')} />
                    {pwdErrors.newPassword && <p className="text-xs text-red-500">Must be 8+ chars with uppercase, lowercase, and number</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm New Password</Label>
                    <Input type="password" {...regPwd('confirmPassword')} />
                    {pwdErrors.confirmPassword && <p className="text-xs text-red-500">{pwdErrors.confirmPassword.message}</p>}
                  </div>
                  <Button type="submit" disabled={passwordMutation.isPending}>
                    {passwordMutation.isPending ? 'Changing...' : 'Change Password'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Management Tab (Admin only) */}
          {isAdmin && (
            <TabsContent value="users">
              <Card className="border-0 shadow-sm">
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Shield className="w-4 h-4" /> User Management</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {users.map((u: { id: string; name: string; email: string; role: string; avatar?: string }) => (
                      <div key={u.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">{getInitials(u.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{u.name}</p>
                            <p className="text-xs text-slate-400">{u.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 cursor-pointer' : 'bg-slate-100 text-slate-700 cursor-pointer'}
                            onClick={() => {
                              if (u.id !== user?.id) {
                                updateRoleMutation.mutate({ id: u.id, role: u.role === 'ADMIN' ? 'MEMBER' : 'ADMIN' });
                              }
                            }}
                          >
                            {u.role}
                          </Badge>
                          {u.id !== user?.id && (
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-red-500" onClick={() => { if (confirm('Delete user?')) deleteUserMutation.mutate(u.id); }}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
