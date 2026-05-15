import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  change?: string;
}

export function StatCard({ title, value, icon: Icon, color, bgColor, change }: StatCardProps) {
  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 font-medium">{title}</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
            {change && <p className="text-xs text-slate-400 mt-1">{change}</p>}
          </div>
          <div className={cn('flex items-center justify-center w-12 h-12 rounded-xl', bgColor)}>
            <Icon className={cn('w-6 h-6', color)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
