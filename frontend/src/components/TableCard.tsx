import React from 'react';
import { Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { Table } from '../backend';

interface TableCardProps {
  table: Table;
  selected?: boolean;
  onClick?: () => void;
  reservedTableIds?: Set<string>;
}

export default function TableCard({ table, selected, onClick, reservedTableIds }: TableCardProps) {
  const isReserved = reservedTableIds?.has(table.id.toString()) ?? false;
  const isOccupied = table.occupied;
  const isAvailable = !isOccupied && !isReserved;

  const statusConfig = isOccupied
    ? { label: 'Occupied', color: 'bg-destructive/10 text-destructive border-destructive/30', icon: XCircle, iconColor: 'text-destructive' }
    : isReserved
    ? { label: 'Reserved', color: 'bg-gold-100 text-gold-700 border-gold-300', icon: Clock, iconColor: 'text-gold-600' }
    : { label: 'Available', color: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle, iconColor: 'text-green-600' };

  const StatusIcon = statusConfig.icon;

  return (
    <Card
      onClick={isAvailable && onClick ? onClick : undefined}
      className={`transition-all duration-200 border-2 ${
        selected
          ? 'border-burgundy-600 shadow-warm bg-burgundy-50'
          : isAvailable && onClick
          ? 'border-cream-300 hover:border-burgundy-400 hover:shadow-warm cursor-pointer'
          : 'border-cream-200 opacity-70'
      } ${!isAvailable && onClick ? 'cursor-not-allowed' : ''}`}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center font-display font-bold text-sm ${
              selected ? 'bg-burgundy-600 text-cream-50' : 'bg-burgundy-100 text-burgundy-700'
            }`}>
              {table.number.toString()}
            </div>
            <span className="font-body text-sm font-medium text-foreground">
              Table {table.number.toString()}
            </span>
          </div>
          <StatusIcon className={`h-4 w-4 ${statusConfig.iconColor}`} />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span className="text-xs font-body">{table.capacity.toString()} seats</span>
          </div>
          <Badge variant="outline" className={`text-xs ${statusConfig.color}`}>
            {statusConfig.label}
          </Badge>
        </div>
        {selected && (
          <div className="mt-2 text-xs text-burgundy-600 font-body font-medium text-center">
            ✓ Selected
          </div>
        )}
      </CardContent>
    </Card>
  );
}
