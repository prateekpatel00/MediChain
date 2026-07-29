'use client';

// ============================================================
// MediChain Web2 Authentication Context — Role-Based Access
// ============================================================
// Manages simulated Web2 user authentication (Govt Admin vs Hospital Node)
// to enforce role-based UX and protected route views.
// ============================================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type UserRole = 'govt' | 'hospital' | null;

export interface UserSession {
  role: UserRole;
  username: string | null;
  hospitalName?: string;
}

export interface AuthContextType {
  user: UserSession;
  isAuthenticated: boolean;
  login: (role: 'govt' | 'hospital', username?: string, hospitalName?: string) => void;
  logout: () => void;
}

const STORAGE_AUTH_KEY = 'medichain_auth_session';

const initialSession: UserSession = {
  role: null,
  username: null,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession>(initialSession);

  // Restore saved session on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_AUTH_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.role) {
          setUser(parsed);
        }
      }
    } catch {}
  }, []);

  const login = useCallback((role: 'govt' | 'hospital', username?: string, hospitalName?: string) => {
    const session: UserSession = {
      role,
      username: username || (role === 'govt' ? 'Govt Super Admin' : 'Apollo Bangalore Node'),
      hospitalName: hospitalName || (role === 'hospital' ? 'Apollo Hospitals Bangalore' : undefined),
    };
    setUser(session);
    try {
      localStorage.setItem(STORAGE_AUTH_KEY, JSON.stringify(session));
    } catch {}
  }, []);

  const logout = useCallback(() => {
    setUser(initialSession);
    try {
      localStorage.removeItem(STORAGE_AUTH_KEY);
    } catch {}
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user.role,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
