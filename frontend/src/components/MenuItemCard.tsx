import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { MenuItem } from '../backend';

interface MenuItemCardProps {
  item: MenuItem;
}

export default function MenuItemCard({ item }: MenuItemCardProps) {
  const price = Number(item.price);
  const formattedPrice = (price / 100).toFixed(2);

  return (
    <Card
      className={`group transition-all duration-200 border-cream-300 shadow-xs hover:shadow-warm ${
        !item.available ? 'opacity-50 grayscale' : 'hover:-translate-y-0.5'
      }`}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-display text-base font-semibold text-foreground leading-tight">
                {item.name}
              </h3>
              {!item.available && (
                <Badge variant="secondary" className="text-xs shrink-0 bg-muted text-muted-foreground">
                  Unavailable
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground font-body leading-relaxed line-clamp-2">
              {item.description}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <span className="font-display text-lg font-semibold text-burgundy-600">
              ${formattedPrice}
            </span>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <Badge
            variant="outline"
            className="text-xs border-gold-400 text-gold-600 bg-gold-50 font-body"
          >
            {item.category}
          </Badge>
          {item.available && (
            <span className="text-xs text-green-600 font-body font-medium flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block" />
              Available
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
