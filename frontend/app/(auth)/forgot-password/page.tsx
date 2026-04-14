'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from '@/styles/pages/auth.module.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic for sending reset link would go here
    setSubmitted(true);
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
          <img src="/logo.svg" alt="RealAI Logo" style={{ width: '180px', height: '100px', objectFit: 'contain' }} />
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>Email Address</label>
              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', background: '#ffffff', border: '1px solid rgba(0,0,0,0.1)', color: '#0a0a0b' }}
                required
              />
            </div>

            <button type="submit" style={{
              width: '100%',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--brand-primary)',
              color: 'white',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              transition: 'var(--transition-snappy)'
            }}>
              Send Reset Link
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p style={{ color: 'var(--text-primary)', marginBottom: '20px' }}>If an account exists for {email}, a recovery link has been sent.</p>
            <Link href="/login" className={styles.link}>Return to Login</Link>
          </div>
        )}

        <p className={styles.footer} style={{ marginTop: '24px' }}>
          Remember your password? <Link href="/login" className={styles.link}>Log in</Link>
        </p>
      </div>
    </div>
  );
}
