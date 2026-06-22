import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

const API = 'http://localhost:3001/api';

interface User {
  id: number;
  nombre: string;
  email: string;
  rol: 'ESTUDIANTE' | 'TUTOR' | 'ENCARGADO';
  semestre?: number | null;
  tutorId?: number | null;
}

interface RegisterData {
  nombre: string;
  email: string;
  password: string;
  rol: 'ESTUDIANTE' | 'TUTOR' | 'ENCARGADO';
  semestre?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]   = useState<User | null>(() => {
    const saved = localStorage.getItem('auth_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('auth_token'));

  useEffect(() => {
    if (user && token) {
      localStorage.setItem('auth_user', JSON.stringify(user));
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_token');
    }
  }, [user, token]);

  const login = async (email: string, password: string) => {
    try {
      const res  = await fetch(`${API}/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) return { ok: false, error: data.error ?? 'Error al iniciar sesión' };

      setUser(data.user);
      setToken(data.token);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: 'No se pudo conectar con el servidor' };
    }
  };

  const register = async (regData: RegisterData) => {
    try {
      const res  = await fetch(`${API}/auth/register`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regData),
      });
      const data = await res.json();

      if (!res.ok) return { ok: false, error: data.error ?? 'Error al registrarse' };

      setUser(data.user);
      setToken(data.token);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: 'No se pudo conectar con el servidor' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}