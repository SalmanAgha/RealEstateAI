'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { User, Shield, Trash2, Mail, Fingerprint } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="animate-fade-in" style={{ maxWidth: '700px', margin: '0 auto' }}>
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>User Identifier: {user?.id}</h1>
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.7rem' }}>Configurations for your personal neural identity.</p>
      </header>
      
      <div className="glass" style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h4 style={{ marginBottom: '16px', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
             <User size={14} color="var(--brand-primary)" /> Identity Profile
          </h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.65rem', marginBottom: '6px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Descriptor</label>
              <input 
                type="text" 
                defaultValue={user?.name} 
                className="glass" 
                style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', color: 'white', fontSize: '0.75rem' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.65rem', marginBottom: '6px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Comms Address</label>
              <input 
                type="email" 
                defaultValue={user?.email} 
                disabled
                className="glass" 
                style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', color: 'var(--text-tertiary)', background: 'rgba(255, 255, 255, 0.02)', border: 'none', fontSize: '0.75rem' }}
              />
            </div>
          </div>
          
          <div style={{ marginTop: '16px' }}>
            <button style={{ padding: '8px 16px', background: 'var(--brand-primary)', color: 'white', borderRadius: 'var(--radius-sm)', fontWeight: '600', fontSize: '0.7rem' }}>
              Commit Changes
            </button>
          </div>
        </div>

        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h4 style={{ marginBottom: '16px', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
             <Fingerprint size={14} color="var(--brand-primary)" /> Security Protocol
          </h4>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '0.75rem', marginBottom: '2px', color: 'var(--text-primary)' }}>Access Token Revision</p>
              <p style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>Re-initialize your security credentials.</p>
            </div>
            <button className="glass" style={{ padding: '6px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.65rem', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}>
              Initialize
            </button>
          </div>
        </div>

        <div style={{ padding: '20px' }}>
          <h4 style={{ marginBottom: '16px', fontSize: '0.75rem', fontWeight: '600', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
             <Trash2 size={14} color="#ef4444" /> System Erasure
          </h4>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '0.75rem', marginBottom: '2px', color: 'var(--text-primary)' }}>Permanent Deletion</p>
              <p style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>Erase all stored neural weights and identity data.</p>
            </div>
            <button style={{ padding: '6px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.65rem', border: '1px solid #ef4444', color: '#ef4444' }}>
              Execute Erasure
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
