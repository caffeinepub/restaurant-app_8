import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  iconBg?: string;
  iconColor?: string;
  trend?: string;
}

export default function StatsCard({ icon: Icon, label, value, iconBg, iconColor, trend }: StatsCardProps) {
  return (
    <Card className="border-cream-300 shadow-xs hover:shadow-warm transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-body font-medium text-muted-foreground uppercase tracking-wider mb-1">
              {label}
            </p>
            <p className="font-display text-2xl font-bold text-foreground">{value}</p>
            {trend && (
              <p className="text-xs text-muted-foreground font-body mt-1">{trend}</p>
            )}
          </div>
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${iconBg || 'bg-burgundy-100'}`}>
            <Icon className={`h-5 w-5 ${iconColor || 'text-burgundy-600'}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
