'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/api';
import styles from '@/styles/pages/auth.module.css';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login: authLogin } = useAuth();
  const router = useRouter();

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await authService.signup({ name, email, password });

      if (response.status === 'success') {
        // After signup, automatically log them in or redirect to login
        router.push('/login');
      }
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
          <img src="/logo.svg" alt="RealAI Logo" style={{ width: '180px', height: '100px', objectFit: 'contain' }} />
        </div>

        {error && (
          <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', marginBottom: '20px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>Full Name</label>
            <input
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', background: '#ffffff', border: '1px solid rgba(0,0,0,0.1)', color: '#0a0a0b' }}
              required
            />
          </div>
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
          <div className={styles.formGroup}>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            Create Account
          </button>
        </form>

        <div className={styles.divider}>
          <div className={styles.dividerLine}></div>
          <span className={styles.dividerText}>OR SIGN UP WITH</span>
          <div className={styles.dividerLine}></div>
        </div>

        <div className={styles.socialGrid}>
          <button className={styles.socialButton} onClick={handleGoogleLogin}>Google</button>
          <button className={styles.socialButton}>GitHub</button>
        </div>

        <p className={styles.footer}>
          Already have an account? <Link href="/login" className={styles.link}>Log in</Link>
        </p>
      </div>
    </div>
  );
}
