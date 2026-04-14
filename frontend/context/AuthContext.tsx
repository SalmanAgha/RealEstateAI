'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  subscription: string;
  status: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('saas_token');
    const savedUser = localStorage.getItem('saas_user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    
    setLoading(false);
  }, []);

  const login = useCallback((newToken: string, newUser: User) => {
    localStorage.setItem('saas_token', newToken);
    localStorage.setItem('saas_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('saas_token');
    localStorage.removeItem('saas_user');
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    user,
    token,
    login,
    logout,
    loading
  }), [user, token, login, logout, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
