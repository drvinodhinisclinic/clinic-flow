// Main layout component with sidebar navigation
import { NavLink } from 'react-router-dom';
import { Users, Calendar, Activity, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface LayoutProps {
  children: React.ReactNode;
}

// Navigation items configuration
const navItems = [
  { to: '/', icon: Users, label: 'Patients' },
  { to: '/appointments', icon: Calendar, label: 'Appointments' },
];

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-sidebar transform transition-transform duration-200 ease-in-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
            <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center">
              <Activity className="w-6 h-6 text-sidebar-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-sidebar-foreground">ClinicCare</h1>
              <p className="text-xs text-sidebar-foreground/60">Management System</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-smooth',
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )
                }
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-sidebar-border">
            <p className="text-xs text-sidebar-foreground/50">
              © 2024 ClinicCare
            </p>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top header for mobile */}
        <header className="lg:hidden bg-card border-b border-border px-4 py-3 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" />
            <span className="font-semibold">ClinicCare</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
