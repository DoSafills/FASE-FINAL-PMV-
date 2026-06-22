import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { useTutoring } from '../../context/TutoringContext';
import { ArrowLeft } from 'lucide-react';
import { CAREERS } from '../../data/careers';

export function StudentRequest() {
  const { user } = useAuth();
  const { createRequest } = useTutoring();
  const navigate = useNavigate();

  const [career, setCareer] = useState('Ingeniería Civil Informática');
  const [semester, setSemester] = useState(1);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [modality, setModality] = useState<'ONLINE' | 'PRESENCIAL'>('ONLINE');

  const [preferredDays, setPreferredDays] = useState<string[]>([]);
  const [preferredStartTime, setPreferredStartTime] = useState('');
  const [preferredEndTime, setPreferredEndTime] = useState('');

  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const start =
      Number(preferredStartTime.split(':')[0]) * 60 +
      Number(preferredStartTime.split(':')[1]);

    const end =
      Number(preferredEndTime.split(':')[0]) * 60 +
      Number(preferredEndTime.split(':')[1]);

    if (
      !subject.trim() ||
      !description.trim() ||
      preferredDays.length === 0 ||
      !preferredStartTime ||
      !preferredEndTime
    ) {
      setError('Por favor, completa todos los campos (asignatura, descripción, día y horario).');
      return;
    }

    if (end - start < 60) {
      setError('Debes indicar al menos 1 hora de disponibilidad.');
      return;
    }

    if (description.trim().length < 20) {
      setError('La descripción de la dificultad debe tener al menos 20 caracteres.');
      return;
    }

    setEnviando(true);
    try {
      await createRequest({
        studentId: String(user!.id),
        studentName: user!.nombre,
        career,
        semester,
        subject: subject.trim(),
        description: description.trim(),
        modality,
        preferredDays,
        preferredStartTime,
        preferredEndTime,
      });
      navigate('/student/dashboard');
    } catch (err: any) {
      setError(err.message ?? 'Error al enviar la solicitud. Intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  const availableCourses =
    CAREERS[career as keyof typeof CAREERS]?.[
      semester as keyof typeof CAREERS[keyof typeof CAREERS]
    ] || [];

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate('/student/dashboard')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver
      </button>

      <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Solicitar Tutoría</h1>
          <p className="text-gray-500 mt-1">Detalla tu dificultad para asignarte el mejor tutor disponible.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Carrera</label>
              <select
                value={career}
                onChange={(e) => {
                  setCareer(e.target.value);
                  setSemester(1);
                  setSubject('');
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              >
                {Object.keys(CAREERS).map(careerName => (
                  <option key={careerName} value={careerName}>{careerName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semestre</label>
              <select
                value={semester}
                onChange={(e) => {
                  setSemester(Number(e.target.value));
                  setSubject('');
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              >
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <option key={num} value={num}>Semestre {num}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Asignatura / Curso</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            >
              <option value="">Selecciona un curso...</option>
              {availableCourses.map(course => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Días disponibles</label>
                <div className="grid grid-cols-2 gap-2">
                  {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"].map(day => (
                    <label key={day} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={preferredDays.includes(day)}
                        onChange={() => {
                          if (preferredDays.includes(day)) {
                            setPreferredDays(preferredDays.filter(d => d !== day));
                          } else {
                            setPreferredDays([...preferredDays, day]);
                          }
                        }}
                      />
                      {day}
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
                  <input
                    type="time"
                    value={preferredStartTime}
                    onChange={(e) => setPreferredStartTime(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
                  <input
                    type="time"
                    value={preferredEndTime}
                    onChange={(e) => setPreferredEndTime(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción de la dificultad</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explica qué temas específicos no comprendes..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Modalidad</label>
            <div className="flex gap-4">
              <label className={`flex-1 border rounded-lg p-4 cursor-pointer transition-all ${modality === 'ONLINE' ? 'border-indigo-600 ring-1 ring-indigo-600 bg-indigo-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="modality"
                    value="ONLINE"
                    checked={modality === 'ONLINE'}
                    onChange={() => setModality('ONLINE')}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="font-medium text-gray-900">Online</span>
                </div>
              </label>
              <label className={`flex-1 border rounded-lg p-4 cursor-pointer transition-all ${modality === 'PRESENCIAL' ? 'border-indigo-600 ring-1 ring-indigo-600 bg-indigo-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="modality"
                    value="PRESENCIAL"
                    checked={modality === 'PRESENCIAL'}
                    onChange={() => setModality('PRESENCIAL')}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="font-medium text-gray-900">Presencial</span>
                </div>
              </label>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={enviando}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {enviando ? 'Enviando...' : 'Enviar Solicitud'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}