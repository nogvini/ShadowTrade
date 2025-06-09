'use client';

import { useEffect } from 'react';
import { ProtectedRoute } from '../../components/auth/protected-route';
import { MainDashboard } from '../../components/main-dashboard';
import { useDashboardApi } from '../../hooks/use-dashboard-api';
import { useMonitoringApi } from '../../hooks/use-monitoring-api';
import { useAuth } from '../../contexts/auth-context';
import { Button } from '../../components/ui/button';
import { LogOut, User } from 'lucide-react';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const { refreshAll, autoRefresh, setAutoRefresh } = useDashboardApi();
  const { getStatus } = useMonitoringApi();

  // Carregar dados iniciais
  useEffect(() => {
    refreshAll();
    getStatus();
  }, [refreshAll, getStatus]);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  ShadowTrade
                </h1>
                <span className="text-sm text-gray-500">
                  Dashboard
                </span>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Auto-refresh toggle */}
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="rounded"
                  />
                  <span>Auto-refresh</span>
                </label>

                {/* User info */}
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{user?.email}</span>
                </div>

                {/* Logout button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sair</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <MainDashboard />
        </main>
      </div>
    </ProtectedRoute>
  );
} 