import React from 'react';
import { ChevronRight, Loader2, Clock, ChefHat, Utensils, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useUpdateOrderStatus } from '../hooks/useQueries';
import type { RestaurantOrder, MenuItem, Table } from '../backend';

const STATUS_FLOW: Record<string, { next: string; label: string; icon: React.ElementType }> = {
  pending: { next: 'preparing', label: 'Start Preparing', icon: ChefHat },
  preparing: { next: 'served', label: 'Mark Served', icon: Utensils },
  served: { next: 'completed', label: 'Complete', icon: CheckCircle2 },
};

const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-gold-100 text-gold-700 border-gold-300',
  preparing: 'bg-blue-50 text-blue-700 border-blue-200',
  served: 'bg-green-50 text-green-700 border-green-200',
  completed: 'bg-muted text-muted-foreground border-muted',
};

const STATUS_ICON: Record<string, React.ElementType> = {
  pending: Clock,
  preparing: ChefHat,
  served: Utensils,
  completed: CheckCircle2,
};

interface OrdersListProps {
  orders: RestaurantOrder[];
  menuItems: MenuItem[];
  tables: Table[];
}

export default function OrdersList({ orders, menuItems, tables }: OrdersListProps) {
  const updateStatus = useUpdateOrderStatus();

  const menuMap = new Map(menuItems.map((m) => [m.id.toString(), m]));
  const tableMap = new Map(tables.map((t) => [t.id.toString(), t]));

  const activeOrders = orders.filter((o) => o.status !== 'completed');
  const completedOrders = orders.filter((o) => o.status === 'completed');

  const renderOrder = (order: RestaurantOrder) => {
    const table = tableMap.get(order.tableId.toString());
    const nextStep = STATUS_FLOW[order.status];
    const StatusIcon = STATUS_ICON[order.status] || Clock;

    return (
      <Card key={order.id.toString()} className="border-cream-300 shadow-xs">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-burgundy-100 flex items-center justify-center">
                <span className="font-display font-bold text-xs text-burgundy-700">
                  {table ? table.number.toString() : '?'}
                </span>
              </div>
              <div>
                <p className="font-body font-semibold text-sm text-foreground">
                  Table {table ? table.number.toString() : order.tableId.toString()}
                </p>
                <p className="text-xs text-muted-foreground font-body">
                  Order #{order.id.toString()} · {new Date(Number(order.createdAt) / 1_000_000).toLocaleTimeString()}
                </p>
              </div>
            </div>
            <Badge variant="outline" className={`text-xs flex items-center gap-1 ${STATUS_BADGE[order.status] || ''}`}>
              <StatusIcon className="h-3 w-3" />
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
          </div>

          <div className="space-y-1 mb-3">
            {order.items.map((item, idx) => {
              const menuItem = menuMap.get(item.menuItemId.toString());
              return (
                <div key={idx} className="flex items-center justify-between text-xs font-body">
                  <span className="text-foreground">
                    {item.quantity.toString()}× {menuItem?.name || `Item #${item.menuItemId}`}
                  </span>
                  {menuItem && (
                    <span className="text-muted-foreground">
                      ${((Number(menuItem.price) * Number(item.quantity)) / 100).toFixed(2)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-cream-200">
            <span className="font-display font-semibold text-sm text-burgundy-600">
              Total: ${(Number(order.totalAmount) / 100).toFixed(2)}
            </span>
            {nextStep && (
              <Button
                size="sm"
                onClick={() => updateStatus.mutate({ orderId: order.id, status: nextStep.next })}
                disabled={updateStatus.isPending}
                className="bg-burgundy-600 hover:bg-burgundy-500 text-cream-50 font-body text-xs h-7 px-3"
              >
                {updateStatus.isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <nextStep.icon className="h-3 w-3 mr-1" />
                )}
                {nextStep.label}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display text-base font-semibold text-foreground mb-3 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-gold-500 inline-block" />
          Active Orders ({activeOrders.length})
        </h3>
        {activeOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground font-body text-center py-6">No active orders.</p>
        ) : (
          <div className="space-y-3">{activeOrders.map(renderOrder)}</div>
        )}
      </div>

      {completedOrders.length > 0 && (
        <div>
          <h3 className="font-display text-base font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-muted-foreground inline-block" />
            Completed ({completedOrders.length})
          </h3>
          <div className="space-y-3 opacity-70">{completedOrders.map(renderOrder)}</div>
        </div>
      )}
    </div>
  );
}
