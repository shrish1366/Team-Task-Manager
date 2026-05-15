'use client';

import { useAuth } from '@/context/AuthContext';
import { Bell, Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import Link from 'next/link';

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-6 shrink-0">
      <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
      <div className="flex items-center gap-3">
        <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
          <Search className="w-5 h-5" />
        </button>
        <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors relative">
          <Bell className="w-5 h-5" />
        </button>
        <Link href="/settings">
          <Avatar className="h-8 w-8 cursor-pointer">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="bg-blue-600 text-white text-xs">{getInitials(user?.name || 'U')}</AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  );
}
