import React, { useState } from 'react';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useGetTables, useAddTable, useRemoveTable } from '../hooks/useQueries';
import type { Table } from '../backend';

export default function TablesManagementSection() {
  const { data: tables = [], isLoading } = useGetTables();
  const addTable = useAddTable();
  const removeTable = useRemoveTable();

  const [number, setNumber] = useState('');
  const [capacity, setCapacity] = useState('');
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Table | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    const num = parseInt(number);
    const cap = parseInt(capacity);
    if (isNaN(num) || num <= 0 || isNaN(cap) || cap <= 0) {
      setFormError('Please enter valid table number and capacity.');
      return;
    }
    try {
      await addTable.mutateAsync({ number: BigInt(num), capacity: BigInt(cap) });
      setNumber('');
      setCapacity('');
    } catch {
      setFormError('Failed to add table. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await removeTable.mutateAsync(deleteTarget.id);
    } catch {
      // silently fail
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-foreground mb-4">Tables Management</h2>

      {/* Add Table Form */}
      <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3 mb-6 p-4 bg-secondary/40 rounded-lg border border-cream-300">
        <div className="space-y-1.5">
          <Label className="font-body text-sm">Table Number</Label>
          <Input
            type="number"
            min="1"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="e.g. 5"
            className="font-body w-28"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="font-body text-sm">Capacity (seats)</Label>
          <Input
            type="number"
            min="1"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            placeholder="e.g. 4"
            className="font-body w-28"
          />
        </div>
        <Button
          type="submit"
          disabled={addTable.isPending}
          className="bg-burgundy-600 hover:bg-burgundy-500 text-cream-50 font-body"
        >
          {addTable.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Plus className="h-4 w-4 mr-1.5" />}
          Add Table
        </Button>
        {formError && <p className="w-full text-xs text-destructive font-body">{formError}</p>}
      </form>

      {/* Tables List */}
      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="font-body text-sm">Loading tables…</span>
        </div>
      ) : tables.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground font-body">
          <p>No tables yet. Add your first table!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {tables.map((table) => (
            <div
              key={table.id.toString()}
              className="flex items-center justify-between p-3 rounded-lg border border-cream-300 bg-card"
            >
              <div>
                <p className="font-body font-semibold text-sm text-foreground">
                  Table {table.number.toString()}
                </p>
                <p className="text-xs text-muted-foreground font-body">
                  {table.capacity.toString()} seats
                </p>
                <Badge
                  variant="outline"
                  className={`text-xs mt-1 ${
                    table.occupied
                      ? 'border-destructive/40 text-destructive'
                      : 'border-green-300 text-green-700'
                  }`}
                >
                  {table.occupied ? 'Occupied' : 'Free'}
                </Badge>
              </div>
              <button
                onClick={() => setDeleteTarget(table)}
                className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                title="Remove table"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">Remove Table?</AlertDialogTitle>
            <AlertDialogDescription className="font-body text-sm">
              Are you sure you want to remove Table {deleteTarget?.number.toString()}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-body text-sm">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-body text-sm"
            >
              {removeTable.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
