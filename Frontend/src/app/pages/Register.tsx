import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../context/AuthContext';

export function Register() {
  const [nombre, setNombre]     = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [semestre, setSemestre] = useState('');
  const [error, setError]       = useState('');
  const [cargando, setCargando] = useState(false);
  const { register } = useAuth();
  const navigate      = useNavigate();

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nombre || !email || !password) {
      setError('Completa todos los campos.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setCargando(true);
    const result = await register({
      nombre,
      email,
      password,
      rol: 'ESTUDIANTE',
      semestre: semestre ? Number(semestre) : undefined,
    });
    setCargando(false);

    if (result.ok) {
      navigate('/student/dashboard');
    } else {
      setError(result.error ?? 'Error al registrarse');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Crear Cuenta de Estudiante</h1>
        <p className="text-sm text-gray-500 mt-2">Regístrate para solicitar tutorías</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="Tu nombre"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="ejemplo@uni.edu"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Semestre</label>
          <input
            type="number"
            min={1}
            max={14}
            value={semestre}
            onChange={(e) => setSemestre(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="Ej: 3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={cargando}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {cargando ? 'Creando cuenta...' : 'Registrarme'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="text-indigo-600 font-medium hover:underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}