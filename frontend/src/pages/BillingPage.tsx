import React, { useState } from 'react';
import { Receipt, Loader2, AlertCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StaffGuard from '../components/StaffGuard';
import BillDetails from '../components/BillDetails';
import { useGetBills, useGetOrders, useGetMenuItems, useGetTables, useCreateBill } from '../hooks/useQueries';

function BillingContent() {
  const { data: bills = [], isLoading: billsLoading } = useGetBills();
  const { data: orders = [], isLoading: ordersLoading } = useGetOrders();
  const { data: menuItems = [] } = useGetMenuItems();
  const { data: tables = [] } = useGetTables();
  const createBill = useCreateBill();

  const [error, setError] = useState('');

  const billedOrderIds = new Set(bills.map((b) => b.orderId.toString()));
  const completedOrders = orders.filter(
    (o) => o.status === 'completed' || o.status === 'served'
  );
  const unbilledOrders = completedOrders.filter((o) => !billedOrderIds.has(o.id.toString()));

  const tableMap = new Map(tables.map((t) => [t.id.toString(), t]));

  const handleCreateBill = async (orderId: bigint) => {
    setError('');
    try {
      await createBill.mutateAsync(orderId);
    } catch {
      setError('Failed to create bill. Please try again.');
    }
  };

  const unpaidBills = bills.filter((b) => b.paymentStatus !== 'paid');
  const paidBills = bills.filter((b) => b.paymentStatus === 'paid');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground mb-1">Billing</h1>
        <p className="font-body text-muted-foreground text-sm">
          Generate bills for completed orders and track payments.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="font-body text-sm">{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="pending">
        <TabsList className="mb-6 bg-secondary border border-cream-300">
          <TabsTrigger value="pending" className="font-body text-sm data-[state=active]:bg-burgundy-600 data-[state=active]:text-cream-50">
            Pending Bills
            {unpaidBills.length > 0 && (
              <Badge className="ml-2 h-4 w-4 p-0 text-xs bg-gold-400 text-burgundy-800 flex items-center justify-center rounded-full">
                {unpaidBills.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="generate" className="font-body text-sm data-[state=active]:bg-burgundy-600 data-[state=active]:text-cream-50">
            Generate Bills
            {unbilledOrders.length > 0 && (
              <Badge className="ml-2 h-4 w-4 p-0 text-xs bg-gold-400 text-burgundy-800 flex items-center justify-center rounded-full">
                {unbilledOrders.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="paid" className="font-body text-sm data-[state=active]:bg-burgundy-600 data-[state=active]:text-cream-50">
            Paid
          </TabsTrigger>
        </TabsList>

        {/* Pending Bills */}
        <TabsContent value="pending">
          {billsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
            </div>
          ) : unpaidBills.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground font-body">
              <Receipt className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No pending bills.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {unpaidBills.map((bill) => (
                <BillDetails
                  key={bill.id.toString()}
                  bill={bill}
                  order={orders.find((o) => o.id === bill.orderId)}
                  menuItems={menuItems}
                  tables={tables}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Generate Bills */}
        <TabsContent value="generate">
          {ordersLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
            </div>
          ) : unbilledOrders.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground font-body">
              <Receipt className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No completed orders awaiting billing.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {unbilledOrders.map((order) => {
                const table = tableMap.get(order.tableId.toString());
                return (
                  <div
                    key={order.id.toString()}
                    className="flex items-center justify-between p-4 rounded-xl border border-cream-300 bg-card shadow-xs"
                  >
                    <div>
                      <p className="font-body font-semibold text-sm text-foreground">
                        Order #{order.id.toString()} · Table {table?.number.toString() ?? order.tableId.toString()}
                      </p>
                      <p className="text-xs text-muted-foreground font-body">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''} ·{' '}
                        <span className="font-semibold text-burgundy-600">
                          ${(Number(order.totalAmount) / 100).toFixed(2)}
                        </span>
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleCreateBill(order.id)}
                      disabled={createBill.isPending}
                      className="bg-burgundy-600 hover:bg-burgundy-500 text-cream-50 font-body text-xs"
                    >
                      {createBill.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                      ) : (
                        <Plus className="h-3.5 w-3.5 mr-1" />
                      )}
                      Generate Bill
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Paid Bills */}
        <TabsContent value="paid">
          {billsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
            </div>
          ) : paidBills.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground font-body">
              <Receipt className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No paid bills yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {paidBills.map((bill) => (
                <BillDetails
                  key={bill.id.toString()}
                  bill={bill}
                  order={orders.find((o) => o.id === bill.orderId)}
                  menuItems={menuItems}
                  tables={tables}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function BillingPage() {
  return (
    <StaffGuard>
      <BillingContent />
    </StaffGuard>
  );
}
