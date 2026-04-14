import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function RootRedirector() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/user');
      }
    }
  }, [user, loading, router]);

  return (
    <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>Syncing terminal with your role...</p>
    </div>
  );
}
