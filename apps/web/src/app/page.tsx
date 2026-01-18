'use client';

import { useEffect, useState } from 'react';
import { AuthForm } from '@/components/auth-form';
import { Dashboard } from '@/components/dashboard';
import { api } from '@/lib/api';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check if we have a valid session by trying to refresh or hit a protected endpoint
    const checkAuth = async () => {
        try {
            // We'll try to refresh the token to see if we have valid cookies
            await api.post('/auth/refresh');
            setIsAuthenticated(true);
        } catch (e) {
            setIsAuthenticated(false);
        } finally {
            setChecking(false);
        }
    };
    checkAuth();
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Dashboard />;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <AuthForm onLogin={() => setIsAuthenticated(true)} />
    </main>
  );
}
