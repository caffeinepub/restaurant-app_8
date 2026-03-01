import React, { useState } from 'react';
import { CalendarDays, Users, User, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import TableCard from '../components/TableCard';
import { useGetTables, useGetReservations, useMakeReservation } from '../hooks/useQueries';

export default function ReservationsPage() {
  const { data: tables = [], isLoading: tablesLoading } = useGetTables();
  const { data: reservations = [], isLoading: resLoading } = useGetReservations();
  const makeReservation = useMakeReservation();

  const [selectedTableId, setSelectedTableId] = useState<bigint | null>(null);
  const [guestName, setGuestName] = useState('');
  const [partySize, setPartySize] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Tables with active reservations
  const reservedTableIds = new Set(
    reservations
      .filter((r) => r.status === 'reserved' || r.status === 'confirmed')
      .map((r) => r.tableId.toString())
  );

  const selectedTable = tables.find((t) => t.id === selectedTableId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!selectedTableId) {
      setError('Please select a table.');
      return;
    }
    if (!guestName.trim()) {
      setError('Please enter your name.');
      return;
    }
    const party = parseInt(partySize);
    if (isNaN(party) || party <= 0) {
      setError('Please enter a valid party size.');
      return;
    }
    if (!dateTime) {
      setError('Please select a date and time.');
      return;
    }
    if (selectedTable && party > Number(selectedTable.capacity)) {
      setError(`This table seats up to ${selectedTable.capacity} guests.`);
      return;
    }

    const dtMs = new Date(dateTime).getTime();
    if (isNaN(dtMs)) {
      setError('Invalid date/time.');
      return;
    }

    try {
      await makeReservation.mutateAsync({
        tableId: selectedTableId,
        guestName: guestName.trim(),
        guestCount: BigInt(party),
        dateTime: BigInt(dtMs * 1_000_000),
      });
      setSuccess(true);
      setGuestName('');
      setPartySize('');
      setDateTime('');
      setSelectedTableId(null);
    } catch (err) {
      setError('Failed to make reservation. Please try again.');
    }
  };

  const isLoading = tablesLoading || resLoading;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground mb-1">Table Reservations</h1>
        <p className="font-body text-muted-foreground text-sm">
          Select an available table and fill in your details to reserve.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Table Grid */}
        <div className="lg:col-span-3">
          <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-burgundy-600" />
            Available Tables
          </h2>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))}
            </div>
          ) : tables.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground font-body">
              <p>No tables available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {tables.map((table) => (
                <TableCard
                  key={table.id.toString()}
                  table={table}
                  selected={selectedTableId === table.id}
                  onClick={() => setSelectedTableId(table.id)}
                  reservedTableIds={reservedTableIds}
                />
              ))}
            </div>
          )}

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-4 text-xs font-body text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-green-500" /> Available
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-gold-500" /> Reserved
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-destructive" /> Occupied
            </span>
          </div>
        </div>

        {/* Reservation Form */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-cream-300 rounded-xl p-6 shadow-xs">
            <h2 className="font-display text-lg font-semibold text-foreground mb-5 flex items-center gap-2">
              <Users className="h-5 w-5 text-burgundy-600" />
              Your Details
            </h2>

            {success && (
              <Alert className="mb-4 border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="font-body text-sm text-green-700">
                  Reservation confirmed! We look forward to seeing you.
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="font-body text-sm">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {selectedTable && (
                <div className="p-3 rounded-lg bg-burgundy-50 border border-burgundy-200 mb-2">
                  <p className="text-xs font-body text-burgundy-700 font-medium">
                    Selected: Table {selectedTable.number.toString()} · {selectedTable.capacity.toString()} seats
                  </p>
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="font-body text-sm font-medium">
                  <User className="h-3.5 w-3.5 inline mr-1" />
                  Guest Name
                </Label>
                <Input
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Your full name"
                  className="font-body"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-body text-sm font-medium">
                  <Users className="h-3.5 w-3.5 inline mr-1" />
                  Party Size
                </Label>
                <Input
                  type="number"
                  min="1"
                  value={partySize}
                  onChange={(e) => setPartySize(e.target.value)}
                  placeholder="Number of guests"
                  className="font-body"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-body text-sm font-medium">
                  <CalendarDays className="h-3.5 w-3.5 inline mr-1" />
                  Date & Time
                </Label>
                <Input
                  type="datetime-local"
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                  className="font-body"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={makeReservation.isPending || !selectedTableId}
                className="w-full bg-burgundy-600 hover:bg-burgundy-500 text-cream-50 font-body font-semibold mt-2"
              >
                {makeReservation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CalendarDays className="h-4 w-4 mr-2" />
                )}
                Reserve Table
              </Button>
            </form>
          </div>

          {/* Recent Reservations */}
          {reservations.length > 0 && (
            <div className="mt-6">
              <h3 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Recent Reservations
              </h3>
              <div className="space-y-2">
                {reservations.slice(-5).reverse().map((res) => {
                  const table = tables.find((t) => t.id === res.tableId);
                  return (
                    <div
                      key={res.id.toString()}
                      className="flex items-center justify-between p-3 rounded-lg border border-cream-200 bg-card text-xs font-body"
                    >
                      <div>
                        <p className="font-medium text-foreground">{res.guestName}</p>
                        <p className="text-muted-foreground">
                          Table {table?.number.toString() ?? res.tableId.toString()} · {res.guestCount.toString()} guests
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          res.status === 'reserved'
                            ? 'border-gold-300 text-gold-700'
                            : res.status === 'confirmed'
                            ? 'border-green-300 text-green-700'
                            : 'border-muted text-muted-foreground'
                        }`}
                      >
                        {res.status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
