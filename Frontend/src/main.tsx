import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './app/context/AuthContext';
import { TutoringProvider } from './app/context/TutoringContext';
import App from './app/App.tsx';
import './styles/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <TutoringProvider>
        <App />
      </TutoringProvider>
    </AuthProvider>
  </StrictMode>
);