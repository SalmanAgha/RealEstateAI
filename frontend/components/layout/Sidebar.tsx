'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, CreditCard, User, ShieldCheck, Shield, TrendingUp, Activity } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  user: any;
}

export default function Sidebar({ isOpen, user }: SidebarProps) {
  const pathname = usePathname();
  const homePath = user?.role === 'admin' ? '/admin' : '/user';

  const navItems = [
    { label: 'Terminal', path: homePath, icon: Home },
    { label: 'Mortgage Advisor', path: '/mortgage', icon: TrendingUp },
    { label: 'Departments', path: '/departments', icon: Users },
    { label: 'Subscriptions', path: '/subscription', icon: CreditCard },
  ];

  if (user?.role === 'admin') {
    navItems.push(
      { label: 'Platform Admins', path: '/admin/admins', icon: ShieldCheck },
      { label: 'Platform Users', path: '/admin/users', icon: Users },
      { label: 'Roles & Rights', path: '/admin/roles', icon: Shield },
      { label: 'Real Estate Portal', path: 'https://realestate.salmanagha.dev', icon: Activity }
    );
  }

  return (
    <aside className="glass" style={{
      width: isOpen ? '220px' : '64px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: isOpen ? 'stretch' : 'center',
      padding: isOpen ? '16px' : '16px 0',
      borderRight: '1px solid var(--border-subtle)',
      transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), padding 0.3s ease',
      zIndex: 10
    }}>
      <Link
        href={homePath}
        style={{
          width: isOpen ? '100%' : '36px',
          height: '36px',
          borderRadius: 'var(--radius-sm)',
          background: isOpen ? 'transparent' : 'var(--bg-tertiary)',
          border: isOpen ? 'none' : '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isOpen ? 'flex-start' : 'center',
          padding: isOpen ? '0 8px' : '0',
          gap: '12px',
          marginBottom: '32px',
          transition: 'all 0.3s ease'
        }}
      >
        {isOpen ? (
          <>
            <img src="/logo.svg" alt="RealAI Logo" style={{ width: '150px', height: '150px', flexShrink: 0 }} />

          </>
        ) : (
          <img src="/favicon.ico" alt="RealAI Icon" style={{ width: '20px', height: '20px', flexShrink: 0 }} />
        )}
      </Link>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.path}
            title={isOpen ? '' : item.label}
            style={{
              width: '100%',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isOpen ? 'flex-start' : 'center',
              padding: isOpen ? '0 12px' : '0',
              gap: '12px',
              color: pathname === item.path ? 'var(--text-primary)' : 'var(--text-tertiary)',
              background: pathname === item.path ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
              transition: 'var(--transition-snappy)'
            }}
          >
            <item.icon size={16} strokeWidth={pathname === item.path ? 2.5 : 2} style={{ flexShrink: 0 }} />
            {isOpen && <span style={{ fontSize: '0.8rem', fontWeight: '500', whiteSpace: 'nowrap' }}>{item.label}</span>}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
