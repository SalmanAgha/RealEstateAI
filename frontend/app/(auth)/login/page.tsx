'use client';
// Lucide react dependency resolution trigger

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/api';
import { Cpu } from 'lucide-react';
import styles from '@/styles/pages/auth.module.css';

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login: authLogin, token: currentToken } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle OAuth callback token from URL
  useEffect(() => {
    const token = searchParams.get('token');
    const userJson = searchParams.get('user');

    // Only proceed if we have a token in URL AND it's different from the one we already have
    if (token && userJson && token !== currentToken) {
      try {
        const decodedUser = decodeURIComponent(userJson);
        const user = JSON.parse(decodedUser);

        authLogin(token, user);

        // Clear parameters from URL for security and to prevent re-execution
        window.history.replaceState({}, document.title, window.location.pathname);

        if (user.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/user');
        }
      } catch (e) {
        console.error('Social login parsing error:', e);
        setError('Failed to process social login. Please try again.');
      }
    }
  }, [searchParams, authLogin, currentToken, router]);

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await authService.login({ email, password });

      if (response.status === 'success') {
        authLogin(response.token, response.user);

        if (response.user.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/user');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
          <img src="/logo.svg" alt="RealAI Logo" style={{ width: '180px', height: '100px', objectFit: 'contain' }} />
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>Email Address</label>
            <input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
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
            <div style={{ textAlign: 'right', marginTop: '8px' }}>
              <Link href="/forgot-password" style={{ fontSize: '0.75rem', color: 'var(--brand-primary)', textDecoration: 'none' }}>Forgot Password?</Link>
            </div>
          </div>

          {error && <p style={{ color: '#ff4d4d', fontSize: '0.875rem', marginBottom: '16px', textAlign: 'center' }}>{error}</p>}

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
            Continue
          </button>
        </form>

        <div className={styles.divider}>
          <div className={styles.dividerLine}></div>
          <span className={styles.dividerText}>OR CONTINUE WITH</span>
          <div className={styles.dividerLine}></div>
        </div>

        <div className={styles.socialGrid}>
          <button className={styles.socialButton} onClick={handleGoogleLogin}>Google</button>
          <button className={styles.socialButton}>GitHub</button>
        </div>

        <p className={styles.footer}>
          Don't have an account? <Link href="/signup" className={styles.link}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading Access...</div>}>
      <LoginContent />
    </Suspense>
  );
}
