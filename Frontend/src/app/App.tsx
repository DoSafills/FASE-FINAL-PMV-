import { RouterProvider } from 'react-router';
import { AuthProvider } from './context/AuthContext';
import { TutoringProvider } from './context/TutoringContext';
import { router } from './routes';

export default function App() {
  return (
    <AuthProvider>
      <TutoringProvider>
        <RouterProvider router={router} />
      </TutoringProvider>
    </AuthProvider>
  );
}
