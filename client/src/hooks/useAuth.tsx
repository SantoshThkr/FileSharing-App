import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import * as authApi from '../services/authApi';
import { AuthResponse, LoginData, RegisterData, User } from '../types/auth';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('token')));

  useEffect(() => {
    if (!localStorage.getItem('token')) return;

    authApi
      .getMe()
      .then(setUser)
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  function saveSession({ user, token }: AuthResponse) {
    localStorage.setItem('token', token);
    setUser(user);
  }

  async function login(data: LoginData) {
    saveSession(await authApi.login(data));
  }

  async function register(data: RegisterData) {
    saveSession(await authApi.register(data));
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
