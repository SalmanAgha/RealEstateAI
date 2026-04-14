'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setIsProfileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isMounted && !loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router, isMounted]);

  if (!isMounted || loading || !user) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100%', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>Initializing AI Terminal...</p>
      </div>
    );
  }

  const labels: Record<string, string> = {
    '/admin': 'Governance',
    '/user': 'Terminal',
    '/departments': 'Departments',
    '/subscription': 'Subscriptions',
    '/profile': 'Profile',
    '/mortgage': 'Mortgage Advisor'
  };
  const currentLabel = labels[pathname] || 'Dashboard';

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-primary)' }}>
      <Sidebar isOpen={isSidebarOpen} user={user} />

      <main style={{ flex: 1, overflowY: 'auto' }}>
        <Header 
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          user={user}
          theme={theme}
          toggleTheme={toggleTheme}
          isProfileOpen={isProfileOpen}
          setIsProfileOpen={setIsProfileOpen}
          logout={logout}
          currentLabel={currentLabel}
        />

        <section style={{ padding: '24px' }}>
          {children}
        </section>
      </main>
    </div>
  );
}
