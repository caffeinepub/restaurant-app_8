import React, { useState } from 'react';
import { Plus, Minus, ShoppingCart, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StaffGuard from '../components/StaffGuard';
import OrdersList from '../components/OrdersList';
import TableCard from '../components/TableCard';
import { useGetTables, useGetMenuItems, useGetOrders, useCreateOrder } from '../hooks/useQueries';
import type { OrderItem } from '../backend';

function OrdersContent() {
  const { data: tables = [], isLoading: tablesLoading } = useGetTables();
  const { data: menuItems = [], isLoading: menuLoading } = useGetMenuItems();
  const { data: orders = [], isLoading: ordersLoading } = useGetOrders();
  const createOrder = useCreateOrder();

  const [selectedTableId, setSelectedTableId] = useState<bigint | null>(null);
  const [cart, setCart] = useState<Map<string, number>>(new Map());
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const addToCart = (menuItemId: string) => {
    setCart((prev) => {
      const next = new Map(prev);
      next.set(menuItemId, (next.get(menuItemId) || 0) + 1);
      return next;
    });
  };

  const removeFromCart = (menuItemId: string) => {
    setCart((prev) => {
      const next = new Map(prev);
      const current = next.get(menuItemId) || 0;
      if (current <= 1) next.delete(menuItemId);
      else next.set(menuItemId, current - 1);
      return next;
    });
  };

  const cartTotal = Array.from(cart.entries()).reduce((sum, [id, qty]) => {
    const item = menuItems.find((m) => m.id.toString() === id);
    return sum + (item ? Number(item.price) * qty : 0);
  }, 0);

  const handleSubmitOrder = async () => {
    setError('');
    setSuccess('');
    if (!selectedTableId) {
      setError('Please select a table.');
      return;
    }
    if (cart.size === 0) {
      setError('Please add at least one item to the order.');
      return;
    }
    const items: OrderItem[] = Array.from(cart.entries()).map(([id, qty]) => ({
      menuItemId: BigInt(id),
      quantity: BigInt(qty),
    }));
    try {
      const orderId = await createOrder.mutateAsync({ tableId: selectedTableId, items });
      setSuccess(`Order #${orderId} created successfully!`);
      setCart(new Map());
      setSelectedTableId(null);
    } catch {
      setError('Failed to create order. Please try again.');
    }
  };

  const categories = Array.from(new Set(menuItems.map((m) => m.category)));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground mb-1">Order Management</h1>
        <p className="font-body text-muted-foreground text-sm">Create and manage table orders.</p>
      </div>

      <Tabs defaultValue="new-order">
        <TabsList className="mb-6 bg-secondary border border-cream-300">
          <TabsTrigger value="new-order" className="font-body text-sm data-[state=active]:bg-burgundy-600 data-[state=active]:text-cream-50">
            New Order
          </TabsTrigger>
          <TabsTrigger value="active-orders" className="font-body text-sm data-[state=active]:bg-burgundy-600 data-[state=active]:text-cream-50">
            Active Orders
            {orders.filter((o) => o.status !== 'completed').length > 0 && (
              <Badge className="ml-2 h-4 w-4 p-0 text-xs bg-gold-400 text-burgundy-800 flex items-center justify-center rounded-full">
                {orders.filter((o) => o.status !== 'completed').length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* New Order Tab */}
        <TabsContent value="new-order">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Table + Menu */}
            <div className="lg:col-span-2 space-y-6">
              {/* Table Selection */}
              <div>
                <h2 className="font-display text-lg font-semibold text-foreground mb-3">1. Select Table</h2>
                {tablesLoading ? (
                  <div className="grid grid-cols-3 gap-3">
                    {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {tables.map((table) => (
                      <TableCard
                        key={table.id.toString()}
                        table={table}
                        selected={selectedTableId === table.id}
                        onClick={() => setSelectedTableId(table.id)}
                      />
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Menu */}
              <div>
                <h2 className="font-display text-lg font-semibold text-foreground mb-3">2. Add Items</h2>
                {menuLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {categories.map((cat) => {
                      const catItems = menuItems.filter((m) => m.category === cat && m.available);
                      if (catItems.length === 0) return null;
                      return (
                        <div key={cat}>
                          <h3 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            {cat}
                          </h3>
                          <div className="space-y-2">
                            {catItems.map((item) => {
                              const qty = cart.get(item.id.toString()) || 0;
                              return (
                                <div
                                  key={item.id.toString()}
                                  className="flex items-center justify-between p-3 rounded-lg border border-cream-300 bg-card"
                                >
                                  <div className="flex-1 min-w-0">
                                    <p className="font-body font-medium text-sm text-foreground">{item.name}</p>
                                    <p className="text-xs text-muted-foreground font-body truncate">{item.description}</p>
                                  </div>
                                  <div className="flex items-center gap-3 ml-3 shrink-0">
                                    <span className="font-display font-semibold text-sm text-burgundy-600">
                                      ${(Number(item.price) / 100).toFixed(2)}
                                    </span>
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => removeFromCart(item.id.toString())}
                                        disabled={qty === 0}
                                        className="h-6 w-6 rounded-full border border-cream-300 flex items-center justify-center hover:bg-secondary disabled:opacity-30 transition-colors"
                                      >
                                        <Minus className="h-3 w-3" />
                                      </button>
                                      <span className="w-5 text-center font-body text-sm font-medium">{qty}</span>
                                      <button
                                        onClick={() => addToCart(item.id.toString())}
                                        className="h-6 w-6 rounded-full bg-burgundy-600 text-cream-50 flex items-center justify-center hover:bg-burgundy-500 transition-colors"
                                      >
                                        <Plus className="h-3 w-3" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-card border border-cream-300 rounded-xl p-5 shadow-xs">
                <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-burgundy-600" />
                  Order Summary
                </h2>

                {success && (
                  <Alert className="mb-4 border-green-200 bg-green-50">
                    <AlertDescription className="font-body text-xs text-green-700">{success}</AlertDescription>
                  </Alert>
                )}
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="font-body text-xs">{error}</AlertDescription>
                  </Alert>
                )}

                {selectedTableId && (
                  <div className="mb-3 p-2 rounded-lg bg-burgundy-50 border border-burgundy-200">
                    <p className="text-xs font-body text-burgundy-700 font-medium">
                      Table {tables.find((t) => t.id === selectedTableId)?.number.toString() ?? '?'}
                    </p>
                  </div>
                )}

                {cart.size === 0 ? (
                  <p className="text-sm text-muted-foreground font-body text-center py-6">
                    No items added yet.
                  </p>
                ) : (
                  <div className="space-y-2 mb-4">
                    {Array.from(cart.entries()).map(([id, qty]) => {
                      const item = menuItems.find((m) => m.id.toString() === id);
                      if (!item) return null;
                      return (
                        <div key={id} className="flex items-center justify-between text-sm font-body">
                          <span className="text-foreground">{qty}× {item.name}</span>
                          <span className="text-muted-foreground">
                            ${((Number(item.price) * qty) / 100).toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                <Separator className="my-3" />
                <div className="flex items-center justify-between mb-4">
                  <span className="font-display font-semibold text-sm">Total</span>
                  <span className="font-display font-bold text-lg text-burgundy-600">
                    ${(cartTotal / 100).toFixed(2)}
                  </span>
                </div>

                <Button
                  onClick={handleSubmitOrder}
                  disabled={createOrder.isPending || cart.size === 0 || !selectedTableId}
                  className="w-full bg-burgundy-600 hover:bg-burgundy-500 text-cream-50 font-body font-semibold"
                >
                  {createOrder.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <ShoppingCart className="h-4 w-4 mr-2" />
                  )}
                  Place Order
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Active Orders Tab */}
        <TabsContent value="active-orders">
          {ordersLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
            </div>
          ) : (
            <OrdersList orders={orders} menuItems={menuItems} tables={tables} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <StaffGuard>
      <OrdersContent />
    </StaffGuard>
  );
}
