import React from 'react';
import {
  UtensilsCrossed,
  TableProperties,
  CalendarDays,
  ClipboardList,
  DollarSign,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import StaffGuard from '../components/StaffGuard';
import StatsCard from '../components/StatsCard';
import MenuManagementSection from '../components/MenuManagementSection';
import TablesManagementSection from '../components/TablesManagementSection';
import { useGetDashboardStats, useIsCallerAdmin } from '../hooks/useQueries';

function AdminContent() {
  const { data: stats, isLoading: statsLoading, isError: statsError } = useGetDashboardStats();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();

  if (adminLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-burgundy-600 mx-auto mb-3" />
          <p className="text-muted-foreground font-body text-sm">Verifying admin access…</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="font-body text-sm">
            Admin access required. You do not have permission to view this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground mb-1">Admin Dashboard</h1>
        <p className="font-body text-muted-foreground text-sm">
          Restaurant operations overview and management.
        </p>
      </div>

      {/* Stats Cards */}
      {statsError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="font-body text-sm">Failed to load dashboard stats.</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
        {statsLoading ? (
          Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
        ) : stats ? (
          <>
            <StatsCard
              icon={TableProperties}
              label="Total Tables"
              value={stats.totalTables.toString()}
              iconBg="bg-burgundy-100"
              iconColor="text-burgundy-600"
            />
            <StatsCard
              icon={UtensilsCrossed}
              label="Occupied"
              value={stats.occupiedTables.toString()}
              iconBg="bg-orange-100"
              iconColor="text-orange-600"
              trend={`of ${stats.totalTables.toString()} tables`}
            />
            <StatsCard
              icon={CalendarDays}
              label="Today's Reservations"
              value={stats.todayReservations.toString()}
              iconBg="bg-blue-100"
              iconColor="text-blue-600"
            />
            <StatsCard
              icon={ClipboardList}
              label="Active Orders"
              value={stats.activeOrders.toString()}
              iconBg="bg-gold-100"
              iconColor="text-gold-600"
            />
            <StatsCard
              icon={DollarSign}
              label="Total Revenue"
              value={`$${(Number(stats.totalRevenue) / 100).toFixed(2)}`}
              iconBg="bg-green-100"
              iconColor="text-green-600"
            />
          </>
        ) : null}
      </div>

      <Separator className="mb-10" />

      {/* Menu Management */}
      <div className="mb-10">
        <MenuManagementSection />
      </div>

      <Separator className="mb-10" />

      {/* Tables Management */}
      <div>
        <TablesManagementSection />
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <StaffGuard>
      <AdminContent />
    </StaffGuard>
  );
}
