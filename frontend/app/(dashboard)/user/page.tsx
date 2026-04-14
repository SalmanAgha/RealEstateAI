'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Network, FolderInput, BatteryCharging, Zap, History, LayoutGrid } from 'lucide-react';

export default function UserDashboardPage() {
  const { user } = useAuth();

  const stats = [
    { label: 'Network Calls', value: '1,280', delta: '+12%', type: 'up', icon: Network },
    { label: 'Project Nodes', value: '14', delta: '+2', type: 'up', icon: FolderInput },
    { label: 'Grid Credits', value: '450', delta: '-15', type: 'down', icon: BatteryCharging },
    { label: 'Runtime Uptime', value: '99.98%', delta: '0%', type: 'steady', icon: Zap },
  ];

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 8px' }}>
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '4px' }}>
          Greetings, {user?.name.split(' ')[0]}
        </h1>
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>
          Operational status for your AI infrastructure and project cluster.
        </p>
      </header>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {stats.map((stat) => (
          <div key={stat.label} className="glass" style={{ padding: '16px', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{stat.value}</h3>
                <span style={{ 
                  fontSize: '0.6rem', 
                  color: stat.type === 'up' ? '#10b981' : stat.type === 'down' ? '#ef4444' : 'var(--text-tertiary)',
                  padding: '2px 6px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255, 255, 255, 0.03)'
                }}>
                  {stat.delta}
                </span>
              </div>
            </div>
            <stat.icon size={18} strokeWidth={1.5} color="var(--brand-primary)" />
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '16px' }}>
        <div className="glass" style={{ gridColumn: 'span 8', padding: '24px', borderRadius: 'var(--radius-lg)', minHeight: '300px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <History size={16} color="var(--brand-primary)" /> Activity Stream
            </h4>
            <button style={{ fontSize: '0.7rem', color: 'var(--brand-primary)' }}>View Logs</button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
                <div style={{ width: '4px', height: '4px', borderRadius: 'var(--radius-full)', background: 'var(--brand-primary)' }}></div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Neural optimization task #{i*152} committed to cluster.</p>
                  <p style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>{i * 15} minutes ago</p>
                </div>
                <button style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>⋯</button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="glass" style={{ gridColumn: 'span 4', padding: '24px', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
             <h4 style={{ fontSize: '0.875rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
               <LayoutGrid size={16} color="var(--brand-primary)" /> Active Nodes
             </h4>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {['Engine-Core-vX', 'Vision-Sync-Alpha', 'Sentiment-Neu-4', 'Deploy-Scale-Z'].map((m) => (
              <div key={m} style={{ padding: '8px 12px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.7rem' }}>{m}</span>
                <span style={{ fontSize: '0.65rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: 'var(--radius-full)', background: '#10b981' }}></div>
                  LIVE
                </span>
              </div>
            ))}
          </div>
          <button style={{ width: '100%', marginTop: '20px', padding: '10px', background: 'var(--brand-primary)', color: 'white', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: '600' }}>
            Initiate Deployment
          </button>
        </div>
      </div>
    </div>
  );
}
