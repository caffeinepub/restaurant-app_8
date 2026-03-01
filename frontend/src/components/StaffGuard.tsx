import React from 'react';
import { ShieldAlert, LogIn } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';

interface StaffGuardProps {
  children: React.ReactNode;
}

export default function StaffGuard({ children }: StaffGuardProps) {
  const { identity, login, loginStatus, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="h-8 w-8 border-2 border-burgundy-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-muted-foreground font-body text-sm">Checking access…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="text-center max-w-sm">
          <div className="h-16 w-16 rounded-full bg-burgundy-100 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="h-8 w-8 text-burgundy-600" />
          </div>
          <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
            Staff Access Required
          </h2>
          <p className="text-muted-foreground font-body text-sm mb-6">
            This section is restricted to restaurant staff. Please sign in to continue.
          </p>
          <Button
            onClick={login}
            disabled={isLoggingIn}
            className="bg-burgundy-600 hover:bg-burgundy-500 text-cream-50 font-body font-semibold px-6"
          >
            <LogIn className="h-4 w-4 mr-2" />
            {isLoggingIn ? 'Signing in…' : 'Staff Sign In'}
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
