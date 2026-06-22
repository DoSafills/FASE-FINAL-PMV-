import { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext';

interface Props {
  children: ReactNode;
  allowedRoles: ('ESTUDIANTE' | 'TUTOR' | 'ENCARGADO')[];
}

export function ProtectedRoute({ children, allowedRoles }: Props) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.rol)) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}