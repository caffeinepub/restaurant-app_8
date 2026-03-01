import React, { useState } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { UtensilsCrossed, CalendarDays, ClipboardList, Receipt, LayoutDashboard, Menu, X, Heart } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const navLinks = [
  { to: '/', label: 'Menu', icon: UtensilsCrossed },
  { to: '/reservations', label: 'Reservations', icon: CalendarDays },
  { to: '/orders', label: 'Orders', icon: ClipboardList },
  { to: '/billing', label: 'Billing', icon: Receipt },
  { to: '/admin', label: 'Admin', icon: LayoutDashboard },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { login, clear, loginStatus, identity, isInitializing } = useInternetIdentity();
  const queryClient = useQueryClient();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: unknown) {
        if (error instanceof Error && error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-burgundy-700 shadow-warm-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <img
                src="/assets/generated/restaurant-logo.dim_200x200.png"
                alt="Restaurant Logo"
                className="h-10 w-10 rounded-full object-cover border-2 border-gold-400 shadow-sm"
              />
              <span className="font-display text-xl font-semibold text-cream-100 tracking-wide group-hover:text-gold-400 transition-colors">
                La Maison
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(({ to, label, icon: Icon }) => {
                const isActive = currentPath === to || (to !== '/' && currentPath.startsWith(to));
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-body font-medium transition-all ${
                      isActive
                        ? 'bg-gold-400 text-burgundy-800'
                        : 'text-cream-200 hover:bg-burgundy-600 hover:text-cream-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* Auth + Mobile Toggle */}
            <div className="flex items-center gap-2">
              {!isInitializing && (
                <Button
                  onClick={handleAuth}
                  disabled={isLoggingIn}
                  size="sm"
                  className={`hidden md:flex font-body text-sm ${
                    isAuthenticated
                      ? 'bg-burgundy-600 hover:bg-burgundy-500 text-cream-100 border border-burgundy-400'
                      : 'bg-gold-400 hover:bg-gold-300 text-burgundy-800 font-semibold'
                  }`}
                >
                  {isLoggingIn ? 'Signing in…' : isAuthenticated ? 'Sign Out' : 'Staff Login'}
                </Button>
              )}
              <button
                className="md:hidden p-2 rounded-md text-cream-200 hover:bg-burgundy-600"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden bg-burgundy-800 border-t border-burgundy-600 px-4 py-3 space-y-1">
            {navLinks.map(({ to, label, icon: Icon }) => {
              const isActive = currentPath === to || (to !== '/' && currentPath.startsWith(to));
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-body font-medium transition-all ${
                    isActive
                      ? 'bg-gold-400 text-burgundy-800'
                      : 'text-cream-200 hover:bg-burgundy-600 hover:text-cream-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
            {!isInitializing && (
              <Button
                onClick={handleAuth}
                disabled={isLoggingIn}
                size="sm"
                className={`w-full mt-2 font-body text-sm ${
                  isAuthenticated
                    ? 'bg-burgundy-600 hover:bg-burgundy-500 text-cream-100 border border-burgundy-400'
                    : 'bg-gold-400 hover:bg-gold-300 text-burgundy-800 font-semibold'
                }`}
              >
                {isLoggingIn ? 'Signing in…' : isAuthenticated ? 'Sign Out' : 'Staff Login'}
              </Button>
            )}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-burgundy-800 text-cream-300 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src="/assets/generated/restaurant-logo.dim_200x200.png"
                alt="La Maison"
                className="h-8 w-8 rounded-full object-cover border border-gold-500 opacity-80"
              />
              <div>
                <p className="font-display text-cream-100 font-medium">La Maison</p>
                <p className="text-xs text-cream-400">Fine Dining Experience</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <p className="text-xs text-cream-400">
                © {new Date().getFullYear()} La Maison. All rights reserved.
              </p>
              <p className="text-xs text-cream-500 flex items-center gap-1">
                Built with{' '}
                <Heart className="h-3 w-3 fill-gold-400 text-gold-400" />{' '}
                using{' '}
                <a
                  href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'restaurant-app')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold-400 hover:text-gold-300 underline underline-offset-2"
                >
                  caffeine.ai
                </a>
              </p>
            </div>
            <div className="flex gap-4 text-xs text-cream-400">
              <Badge variant="outline" className="border-gold-600 text-gold-400 text-xs">
                {isAuthenticated ? 'Staff Mode' : 'Guest Mode'}
              </Badge>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
