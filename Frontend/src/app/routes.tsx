import { createBrowserRouter, Navigate } from 'react-router';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { StudentDashboard } from './pages/student/Dashboard';
import { StudentRequest } from './pages/student/RequestForm';
import { TutorDashboard } from './pages/tutor/Dashboard';
import { AdminDashboard } from './pages/admin/Dashboard';

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/login" replace /> },
      { path: "login", element: <Login /> },
      { path: "student/dashboard", element: <StudentDashboard /> },
      { path: "student/request", element: <StudentRequest /> },
      { path: "tutor/dashboard", element: <TutorDashboard /> },
      { path: "admin/dashboard", element: <AdminDashboard /> },
    ]
  }
]);
