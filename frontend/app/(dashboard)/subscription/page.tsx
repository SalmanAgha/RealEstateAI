'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Zap, Hexagon, Component, CreditCard, ExternalLink } from 'lucide-react';

export default function SubscriptionPage() {
  const { user } = useAuth();

  const plans = [
    { name: 'Standard', price: '$0', features: ['AI Core Nodes', '15 Projects', '10GB Data', 'Standard Uplink'], icon: Hexagon, current: user?.subscription === 'free' },
    { name: 'Elevated', price: '$29', features: ['Advanced Suite', 'Unlimited Projects', '100GB Data', 'Priority Uplink'], icon: Zap, current: user?.subscription === 'pro' },
    { name: 'Nexus', price: '$199', features: ['Custom LLM Node', 'Enterprise RBAC', 'Unlimited Data', 'Direct Comms'], icon: Component, current: user?.subscription === 'enterprise' },
  ];

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px' }}>Service Protocols</h1>
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>Select a subscription tier to expand your AI capabilities.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {plans.map((plan) => (
          <div key={plan.name} className="glass" style={{ 
            padding: '30px 24px', 
            borderRadius: 'var(--radius-lg)', 
            border: plan.current ? '1.5px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
            background: plan.current ? 'rgba(59, 130, 246, 0.05)' : 'var(--glass-bg)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {plan.current && (
              <span style={{ 
                position: 'absolute', 
                top: '16px', 
                right: '16px', 
                background: 'var(--brand-primary)', 
                color: 'white', 
                fontSize: '0.6rem', 
                fontWeight: '700',
                padding: '2px 8px', 
                borderRadius: 'var(--radius-sm)',
                textTransform: 'uppercase'
              }}>
                Active
              </span>
            )}
            
            <div style={{ marginBottom: '24px' }}>
               <plan.icon size={28} color={plan.current ? 'var(--brand-primary)' : 'var(--text-tertiary)'} strokeWidth={1} />
               <h3 style={{ fontSize: '1rem', marginTop: '16px', fontWeight: '700' }}>{plan.name} Tier</h3>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '24px' }}>
              <span style={{ fontSize: '1.75rem', fontWeight: '700' }}>{plan.price}</span>
              <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>/ monthly</span>
            </div>
            
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px', flex: 1 }}>
              {plan.features.map((f) => (
                <li key={f} style={{ display: 'flex', fontSize: '0.7rem', color: 'var(--text-secondary)', gap: '10px', alignItems: 'center' }}>
                  <div style={{ width: '4px', height: '4px', borderRadius: 'var(--radius-full)', background: plan.current ? 'var(--brand-primary)' : 'var(--border-strong)' }}></div>
                  {f}
                </li>
              ))}
            </ul>
            
            <button 
              style={{ 
                width: '100%', 
                padding: '10px', 
                borderRadius: 'var(--radius-sm)', 
                background: plan.current ? 'none' : 'var(--brand-primary)',
                border: plan.current ? '1px solid var(--border-strong)' : 'none',
                color: plan.current ? 'var(--text-primary)' : 'white',
                fontWeight: '700',
                fontSize: '0.75rem',
                cursor: plan.current ? 'default' : 'pointer'
              }}
              disabled={plan.current}
            >
              {plan.current ? 'Manage Protocol' : 'Scale To ' + plan.name}
            </button>
          </div>
        ))}
      </div>

      <div className="glass" style={{ marginTop: '40px', padding: '20px 24px', borderRadius: 'var(--radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '8px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-tertiary)' }}>
             <CreditCard size={18} color="var(--brand-primary)" />
          </div>
          <div>
            <h4 style={{ fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>Uplink Configuration</h4>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.65rem' }}>Update your billing gateways and regional currency settings.</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="glass" style={{ padding: '6px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '6px' }}>PayPal <ExternalLink size={10} /></button>
          <button className="glass" style={{ padding: '6px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '6px' }}>Stripe <ExternalLink size={10} /></button>
        </div>
      </div>
    </div>
  );
}
