import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

interface AuthContextType {
  token: string | null;
  isNewUser: boolean;
  isGuest: boolean;
  login: (token: string, isNewUser: boolean) => void;
  loginAsGuest: () => void;
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
  const [isGuest, setIsGuest] = useState<boolean>(
    () => localStorage.getItem('isGuest') === 'true'
  );

  const login = useCallback((token: string, isNewUser: boolean) => {
    localStorage.setItem('token', token);
    localStorage.setItem('isNewUser', String(isNewUser));
    localStorage.removeItem('isGuest');
    setToken(token);
    setIsNewUser(isNewUser);
    setIsGuest(false);
  }, []);

  const loginAsGuest = useCallback(() => {
    localStorage.setItem('isGuest', 'true');
    localStorage.removeItem('token');
    localStorage.removeItem('isNewUser');
    setToken(null);
    setIsNewUser(false);
    setIsGuest(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('isNewUser');
    localStorage.removeItem('isGuest');
    localStorage.removeItem('guestRecords');
    setToken(null);
    setIsNewUser(false);
    setIsGuest(false);
  }, []);

  return (
    <AuthContext.Provider value={{ token, isNewUser, isGuest, login, loginAsGuest, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};