import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from './types';

interface AuthContextType {
  user: User | null;
  login: (email: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ENCARGADO: User = { id: 'a1', name: 'Admin Principal', email: 'admin@uni.edu', role: 'ENCARGADO' };

const ESTUDIANTES: User[] = [
  { id: 'u1', name: 'Ana Estudiante',    email: 'ana@uni.edu',    role: 'ESTUDIANTE', semester: 1 },
  { id: 'u2', name: 'Carlos Estudiante', email: 'carlos@uni.edu', role: 'ESTUDIANTE', semester: 4 },
];
const TUTOR_PRUEBA: User = {
  id:           '1',        // debe coincidir con el id real en tu BD
  name:         'Tutor Prueba',
  email:        'tutor@prueba.cl',
  role:         'TUTOR',
  specialties:  [],
  courses:      [],
  availability: [],
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('tutoring_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) localStorage.setItem('tutoring_user', JSON.stringify(user));
    else localStorage.removeItem('tutoring_user');
  }, [user]);

  const login = async (email: string): Promise<boolean> => {
    // Encargado
    if (email === ENCARGADO.email) { setUser(ENCARGADO); return true; }
    if (email === TUTOR_PRUEBA.email)   { setUser(TUTOR_PRUEBA);   return true; }
    // Estudiantes de prueba
    const est = ESTUDIANTES.find(u => u.email === email);
    if (est) { setUser(est); return true; }

    // Tutores → buscar en la BD
    try {
      const res  = await fetch('http://localhost:3001/api/tutores');
      const data = await res.json();
      const tutor = data.find((t: any) => t.email === email);
      if (tutor) {
        const u: User = {
          id:           String(tutor.id),
          name:         tutor.nombre,
          email:        tutor.email,
          role:         'TUTOR',
          specialties:  tutor.especializaciones?.map((e: any) => e.nombre) ?? [],
          courses:      tutor.cursos?.map((c: any) => c.curso) ?? [],
          availability: tutor.horarios?.map((h: any) => ({
            days:      [h.dia],
            startTime: h.hora_inicio,
            endTime:   h.hora_fin,
          })) ?? [],
        };
        setUser(u);
        return true;
      }
    } catch (err) {
      console.error('Error conectando con la BD:', err);
    }

    return false;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}