import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

interface AuthContextType {
  token: string | null;
  isNewUser: boolean;
  login: (token: string, isNewUser: boolean) => void;
  completeOnboarding: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('token')
  );
  const [isNewUser, setIsNewUser] = useState<boolean>(
    () => localStorage.getItem('isNewUser') === 'true'
  );

  const login = useCallback((token: string, isNewUser: boolean) => {
    localStorage.setItem('token', token);
    localStorage.setItem('isNewUser', String(isNewUser));
    setToken(token);
    setIsNewUser(isNewUser);
  }, []);

  const completeOnboarding = useCallback(() => {
    localStorage.setItem('isNewUser', 'false');
    setIsNewUser(false);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('isNewUser');
    setToken(null);
    setIsNewUser(false);
  }, []);

  return (
    <AuthContext.Provider value={{ token, isNewUser, login, completeOnboarding, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};