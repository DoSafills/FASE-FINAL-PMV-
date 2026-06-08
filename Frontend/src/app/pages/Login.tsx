import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';

export function Login() {
  const [email, setEmail]     = useState('');
  const [error, setError]     = useState('');
  const [cargando, setCargando] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Por favor, ingresa un correo.');
      return;
    }

    setCargando(true);
    const success = await login(email);
    setCargando(false);

    if (success) {
      const saved = localStorage.getItem('tutoring_user');
      const user  = saved ? JSON.parse(saved) : null;
      if (user?.role === 'ESTUDIANTE')  navigate('/student/dashboard');
      else if (user?.role === 'TUTOR')  navigate('/tutor/dashboard');
      else if (user?.role === 'ENCARGADO') navigate('/admin/dashboard');
    } else {
      setError('Correo no encontrado. Verifica que estés registrado.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Iniciar Sesión</h1>
        <p className="text-sm text-gray-500 mt-2">Ingresa con tu correo universitario</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Correo Electrónico
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            placeholder="ejemplo@uni.edu"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={cargando}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {cargando ? 'Verificando...' : 'Entrar'}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-100">
        <p className="text-sm text-gray-500 mb-3 font-medium">Correos de prueba:</p>
        <ul className="text-xs space-y-2 text-gray-600">
          <li><strong>Estudiante:</strong> ana@uni.edu</li>
          <li><strong>Tutor:</strong> usa el email con que registraste un tutor</li>
          <li><strong>Encargado:</strong> admin@uni.edu</li>
        </ul>
      </div>
    </div>
  );
}