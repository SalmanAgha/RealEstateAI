'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  PanelLeftClose, 
  PanelLeftOpen, 
  Sun, 
  Moon, 
  User, 
  LogOut, 
  Bell, 
  Info, 
  CheckCircle, 
  AlertTriangle,
  X 
} from 'lucide-react';
import { notificationService } from '@/services/api';

interface HeaderProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  user: any;
  theme: string;
  toggleTheme: () => void;
  isProfileOpen: boolean;
  setIsProfileOpen: (open: boolean) => void;
  logout: () => void;
  currentLabel: string;
}

export default function Header({ 
  isSidebarOpen, 
  toggleSidebar, 
  user, 
  theme, 
  toggleTheme, 
  isProfileOpen, 
  setIsProfileOpen, 
  logout,
  currentLabel 
}: HeaderProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getNotifications();
      if (res.status === 'success') {
        const data = res.data;
        setNotifications(data);
        setUnreadCount(data.filter((n: any) => !n.isRead).length);
      }
    } catch (err: any) {
      console.error('Notification Error:', err.message || 'Network failure');
      // If we get an auth error, it's likely session expired
      if (err.message && (err.message.includes('token') || err.message.includes('auth'))) {
        console.warn('Session expired. Please log in again.');
        logout();
      }
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000); // 1-minute check
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle size={14} color="#10b981" />;
      case 'warning': return <AlertTriangle size={14} color="#f59e0b" />;
      case 'error': return <AlertTriangle size={14} color="#ef4444" />;
      default: return <Info size={14} color="var(--brand-primary)" />;
    }
  };

  return (
    <header className="glass" style={{ 
      height: '48px', 
      display: 'flex', 
      alignItems: 'center', 
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <button 
        onClick={toggleSidebar}
        style={{ 
          background: 'none', 
          border: 'none', 
          color: 'var(--text-tertiary)', 
          cursor: 'pointer',
          marginRight: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4px',
          borderRadius: 'var(--radius-sm)',
          transition: 'var(--transition-snappy)'
        }}
      >
        {isSidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
      </button>

      <h2 style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', letterSpacing: '0.05em', textTransform: 'uppercase', flex: 1 }}>
        {currentLabel}
      </h2>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
        <div style={{ textAlign: 'right', marginRight: '8px' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: '600' }}>{user?.name?.split(' ')[0]}</p>
          <p style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>{user?.subscription} grid</p>
        </div>

        {/* Neural Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => {
              setShowNotifications(!showNotifications);
              setIsProfileOpen(false);
            }}
            style={{ 
              width: '28px', 
              height: '28px', 
              borderRadius: 'var(--radius-sm)', 
              background: 'var(--bg-tertiary)', 
              border: '1px solid var(--border-subtle)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: unreadCount > 0 ? 'var(--brand-primary)' : 'var(--text-secondary)',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            <Bell size={14} />
            {unreadCount > 0 && (
              <span style={{ 
                position: 'absolute', 
                top: '-2px', 
                right: '-2px', 
                width: '10px', 
                height: '10px', 
                background: '#ef4444', 
                borderRadius: '50%', 
                border: '2px solid var(--bg-primary)' 
              }} />
            )}
          </button>

          {showNotifications && (
            <div className="glass animated-fade-in" style={{ 
              position: 'absolute', 
              top: '40px', 
              right: 0, 
              width: '280px', 
              maxHeight: '400px',
              overflowY: 'auto',
              borderRadius: 'var(--radius-md)', 
              border: '1px solid var(--border-subtle)',
              boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.5)',
              zIndex: 100
            }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recent Alerts</p>
                <button onClick={handleMarkAllRead} style={{ fontSize: '0.6rem', color: 'var(--brand-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>All Read</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.7rem' }}>No recent activity.</div>
                ) : notifications.map((n) => (
                  <div 
                    key={n.id} 
                    style={{ 
                      padding: '12px 16px', 
                      borderBottom: '1px solid var(--border-subtle)', 
                      background: n.isRead ? 'transparent' : 'rgba(59, 130, 246, 0.05)',
                      cursor: 'pointer',
                      transition: '0.2s'
                    }}
                    onClick={(e) => !n.isRead && handleMarkRead(n.id, e)}
                  >
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '4px' }}>
                      <div style={{ marginTop: '2px' }}>{getTypeIcon(n.type)}</div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{n.title}</p>
                        <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{n.message}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ fontSize: '0.55rem', color: 'var(--text-tertiary)' }}>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      {!n.isRead && <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--brand-primary)' }} />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <button 
          onClick={toggleTheme}
          style={{ 
            width: '28px', 
            height: '28px', 
            borderRadius: 'var(--radius-sm)', 
            background: 'var(--bg-tertiary)', 
            border: '1px solid var(--border-subtle)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: 'var(--text-secondary)',
            cursor: 'pointer'
          }}
        >
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
        </button>
        
        <button 
          onClick={() => {
            setIsProfileOpen(!isProfileOpen);
            setShowNotifications(false);
          }}
          style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 'bold', color: 'var(--brand-primary)', cursor: 'pointer' }}
        >
          {user?.name ? user.name[0] : 'U'}
        </button>

        {isProfileOpen && (
          <div className="glass animated-fade-in" style={{ 
            position: 'absolute', 
            top: '40px', 
            right: 0, 
            width: '180px', 
            padding: '8px', 
            borderRadius: 'var(--radius-md)', 
            border: '1px solid var(--border-subtle)',
            boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.5)',
            zIndex: 100
          }}>
            <div style={{ padding: '8px', marginBottom: '8px', borderBottom: '1px solid var(--border-subtle)' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{user?.name}</p>
              <p style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>{user?.email}</p>
            </div>
            
            <Link href="/profile" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              padding: '8px', 
              borderRadius: 'var(--radius-sm)', 
              color: 'var(--text-secondary)', 
              fontSize: '0.75rem'
            }}>
              <User size={14} /> My Profile
            </Link>
            
            <button 
              onClick={logout}
              style={{ 
                width: '100%',
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                padding: '8px', 
                borderRadius: 'var(--radius-sm)', 
                color: '#ef4444', 
                fontSize: '0.75rem',
                textAlign: 'left'
              }}
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
