import { createBrowserRouter, Navigate } from 'react-router';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { StudentDashboard } from './pages/student/Dashboard';
import { StudentRequest } from './pages/student/RequestForm';
import { TutorDashboard } from './pages/tutor/Dashboard';
import { AdminDashboard } from './pages/admin/Dashboard';
import { ProtectedRoute } from './components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/login" replace /> },
      { path: "login",    element: <Login /> },
      { path: "register", element: <Register /> },
      {
        path: "student/dashboard",
        element: <ProtectedRoute allowedRoles={['ESTUDIANTE']}><StudentDashboard /></ProtectedRoute>,
      },
      {
        path: "student/request",
        element: <ProtectedRoute allowedRoles={['ESTUDIANTE']}><StudentRequest /></ProtectedRoute>,
      },
      {
        path: "tutor/dashboard",
        element: <ProtectedRoute allowedRoles={['TUTOR']}><TutorDashboard /></ProtectedRoute>,
      },
      {
        path: "admin/dashboard",
        element: <ProtectedRoute allowedRoles={['ENCARGADO']}><AdminDashboard /></ProtectedRoute>,
      },
    ]
  }
]);