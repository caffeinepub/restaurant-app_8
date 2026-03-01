import React from 'react';
import { CheckCircle2, Clock, Loader2, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useMarkBillPaid } from '../hooks/useQueries';
import type { Bill, RestaurantOrder, MenuItem, Table } from '../backend';

interface BillDetailsProps {
  bill: Bill;
  order: RestaurantOrder | undefined;
  menuItems: MenuItem[];
  tables: Table[];
}

export default function BillDetails({ bill, order, menuItems, tables }: BillDetailsProps) {
  const markPaid = useMarkBillPaid();
  const menuMap = new Map(menuItems.map((m) => [m.id.toString(), m]));
  const tableMap = new Map(tables.map((t) => [t.id.toString(), t]));
  const table = order ? tableMap.get(order.tableId.toString()) : undefined;
  const isPaid = bill.paymentStatus === 'paid';

  return (
    <div className={`rounded-xl border-2 p-5 transition-all ${isPaid ? 'border-green-200 bg-green-50/50' : 'border-cream-300 bg-card'}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-full bg-burgundy-100 flex items-center justify-center">
            <Receipt className="h-4 w-4 text-burgundy-600" />
          </div>
          <div>
            <p className="font-body font-semibold text-sm text-foreground">
              Bill #{bill.id.toString()}
            </p>
            <p className="text-xs text-muted-foreground font-body">
              {table ? `Table ${table.number.toString()}` : `Order #${bill.orderId.toString()}`}
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className={`text-xs flex items-center gap-1 ${
            isPaid
              ? 'border-green-300 text-green-700 bg-green-50'
              : 'border-gold-300 text-gold-700 bg-gold-50'
          }`}
        >
          {isPaid ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
          {isPaid ? 'Paid' : 'Unpaid'}
        </Badge>
      </div>

      {/* Items */}
      {order && (
        <div className="space-y-1.5 mb-4">
          {order.items.map((item, idx) => {
            const menuItem = menuMap.get(item.menuItemId.toString());
            const lineTotal = menuItem ? Number(menuItem.price) * Number(item.quantity) : 0;
            return (
              <div key={idx} className="flex items-center justify-between text-sm font-body">
                <span className="text-foreground">
                  {item.quantity.toString()}× {menuItem?.name || `Item #${item.menuItemId}`}
                </span>
                <span className="text-muted-foreground">${(lineTotal / 100).toFixed(2)}</span>
              </div>
            );
          })}
        </div>
      )}

      <Separator className="my-3" />

      {/* Total */}
      <div className="flex items-center justify-between mb-4">
        <span className="font-display font-semibold text-base text-foreground">Total</span>
        <span className="font-display font-bold text-lg text-burgundy-600">
          ${(Number(bill.totalAmount) / 100).toFixed(2)}
        </span>
      </div>

      {/* Action */}
      {!isPaid && (
        <Button
          onClick={() => markPaid.mutate(bill.id)}
          disabled={markPaid.isPending}
          className="w-full bg-green-600 hover:bg-green-500 text-white font-body font-semibold"
        >
          {markPaid.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <CheckCircle2 className="h-4 w-4 mr-2" />
          )}
          Mark as Paid
        </Button>
      )}
      {isPaid && (
        <div className="flex items-center justify-center gap-2 text-green-600 font-body text-sm font-medium">
          <CheckCircle2 className="h-4 w-4" />
          Payment received
        </div>
      )}
    </div>
  );
}
