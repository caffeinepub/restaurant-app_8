import React, { useState } from 'react';
import { Plus, Edit2, ToggleLeft, ToggleRight, Loader2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useGetMenuItems, useAddMenuItem, useUpdateMenuItem, useToggleMenuItemAvailability } from '../hooks/useQueries';
import type { MenuItem } from '../backend';

const CATEGORIES = ['Starters', 'Mains', 'Desserts', 'Drinks', 'Specials'];

interface MenuFormData {
  name: string;
  description: string;
  price: string;
  category: string;
}

const emptyForm: MenuFormData = { name: '', description: '', price: '', category: 'Mains' };

export default function MenuManagementSection() {
  const { data: items = [], isLoading } = useGetMenuItems();
  const addItem = useAddMenuItem();
  const updateItem = useUpdateMenuItem();
  const toggleAvailability = useToggleMenuItemAvailability();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [form, setForm] = useState<MenuFormData>(emptyForm);
  const [formError, setFormError] = useState('');

  const openAdd = () => {
    setForm(emptyForm);
    setFormError('');
    setShowAddDialog(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditItem(item);
    setForm({
      name: item.name,
      description: item.description,
      price: (Number(item.price) / 100).toFixed(2),
      category: item.category,
    });
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    const priceNum = Math.round(parseFloat(form.price) * 100);
    if (!form.name.trim() || isNaN(priceNum) || priceNum <= 0) {
      setFormError('Please fill in all fields with valid values.');
      return;
    }
    try {
      if (editItem) {
        await updateItem.mutateAsync({
          id: editItem.id,
          name: form.name.trim(),
          description: form.description.trim(),
          price: BigInt(priceNum),
          category: form.category,
        });
        setEditItem(null);
      } else {
        await addItem.mutateAsync({
          name: form.name.trim(),
          description: form.description.trim(),
          price: BigInt(priceNum),
          category: form.category,
        });
        setShowAddDialog(false);
      }
    } catch {
      setFormError('Failed to save menu item. Please try again.');
    }
  };

  const grouped = CATEGORIES.reduce<Record<string, MenuItem[]>>((acc, cat) => {
    acc[cat] = items.filter((i) => i.category === cat);
    return acc;
  }, {});
  const otherItems = items.filter((i) => !CATEGORIES.includes(i.category));
  if (otherItems.length > 0) grouped['Other'] = otherItems;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-semibold text-foreground">Menu Management</h2>
        <Button
          onClick={openAdd}
          size="sm"
          className="bg-burgundy-600 hover:bg-burgundy-500 text-cream-50 font-body"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add Item
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="font-body text-sm">Loading menu…</span>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground font-body">
          <p>No menu items yet. Add your first item!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([cat, catItems]) =>
            catItems.length === 0 ? null : (
              <div key={cat}>
                <h3 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  {cat}
                </h3>
                <div className="space-y-2">
                  {catItems.map((item) => (
                    <div
                      key={item.id.toString()}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        item.available ? 'border-cream-300 bg-card' : 'border-cream-200 bg-muted/30 opacity-70'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-body font-medium text-sm text-foreground">{item.name}</span>
                          <Badge
                            variant="outline"
                            className={`text-xs ${item.available ? 'border-green-300 text-green-700' : 'border-muted text-muted-foreground'}`}
                          >
                            {item.available ? 'Available' : 'Unavailable'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground font-body truncate mt-0.5">{item.description}</p>
                      </div>
                      <div className="flex items-center gap-3 ml-3 shrink-0">
                        <span className="font-display font-semibold text-sm text-burgundy-600">
                          ${(Number(item.price) / 100).toFixed(2)}
                        </span>
                        <button
                          onClick={() => openEdit(item)}
                          className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => toggleAvailability.mutate(item.id)}
                          disabled={toggleAvailability.isPending}
                          className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                          title={item.available ? 'Mark unavailable' : 'Mark available'}
                        >
                          {item.available ? (
                            <ToggleRight className="h-4 w-4 text-green-600" />
                          ) : (
                            <ToggleLeft className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-lg text-burgundy-700">Add Menu Item</DialogTitle>
          </DialogHeader>
          <MenuItemForm
            form={form}
            setForm={setForm}
            onSubmit={handleSubmit}
            isPending={addItem.isPending}
            error={formError}
            onCancel={() => setShowAddDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onOpenChange={(open) => !open && setEditItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-lg text-burgundy-700">Edit Menu Item</DialogTitle>
          </DialogHeader>
          <MenuItemForm
            form={form}
            setForm={setForm}
            onSubmit={handleSubmit}
            isPending={updateItem.isPending}
            error={formError}
            onCancel={() => setEditItem(null)}
            submitLabel="Save Changes"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface MenuItemFormProps {
  form: MenuFormData;
  setForm: (f: MenuFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
  error: string;
  onCancel: () => void;
  submitLabel?: string;
}

function MenuItemForm({ form, setForm, onSubmit, isPending, error, onCancel, submitLabel = 'Add Item' }: MenuItemFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 mt-1">
      <div className="space-y-1.5">
        <Label className="font-body text-sm">Name</Label>
        <Input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="e.g. Grilled Salmon"
          className="font-body"
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label className="font-body text-sm">Description</Label>
        <Textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Brief description of the dish"
          className="font-body text-sm resize-none"
          rows={2}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="font-body text-sm">Price ($)</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            placeholder="0.00"
            className="font-body"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label className="font-body text-sm">Category</Label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm font-body shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>
      {error && <p className="text-xs text-destructive font-body">{error}</p>}
      <DialogFooter className="gap-2">
        <Button type="button" variant="outline" onClick={onCancel} className="font-body text-sm">
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="bg-burgundy-600 hover:bg-burgundy-500 text-cream-50 font-body text-sm"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
          {submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );
}
