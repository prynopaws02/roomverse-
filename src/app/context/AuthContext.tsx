'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export type UserRole = 'student' | 'owner' | 'admin';

export interface User {
  email: string;
  role: UserRole;
  name: string;
  pgId?: string; // For PG/Mess owners, links them to a specific PG listing
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if session is persisted in local storage
    const savedUser = localStorage.getItem('pg_rent_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse saved user session', e);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, role: UserRole): Promise<boolean> => {
    setLoading(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    let name = 'Student';
    let pgId: string | undefined = undefined;

    if (role === 'admin') {
      name = 'System Administrator';
    } else if (role === 'owner') {
      if (email.includes('ivy') || email === 'owner@ivyheights.com') {
        name = 'Vikram Malhotra (Ivy Owner)';
        pgId = 'pg-1';
      } else {
        name = 'Rajesh Kumar (Owner)';
        pgId = 'pg-3';
      }
    } else {
      name = 'Aarav Sharma';
    }

    const newUser: User = { email, role, name, pgId };
    setUser(newUser);
    localStorage.setItem('pg_rent_user', JSON.stringify(newUser));
    setLoading(false);

    // Redirect to corresponding page
    if (role === 'admin') {
      router.push('/admin');
    } else if (role === 'owner') {
      router.push('/owner');
    } else {
      router.push('/student');
    }
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('pg_rent_user');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
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
