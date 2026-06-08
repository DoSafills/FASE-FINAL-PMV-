import { useState } from 'react';
import { academicAreas } from '../../data/academicAreas';
import { useAuth } from '../../context/AuthContext';
import { useTutoring } from '../../context/TutoringContext';
import { Check, X, BookOpen, Edit2, CheckSquare, FileText, AlertTriangle, Users } from 'lucide-react';
import {
  User,
  CourseAvailability
} from '../../context/types';


export function TutorDashboard() {
  const { user } = useAuth();
  
  const {
  requests,
  acceptRequest,
  rejectRequest,
  cancelRequest,
  finishRequest,
  registerAttendance,
  getTutors,
  updateTutor,
  updateCourseAvailability
} = useTutoring();

  const currentUserData = getTutors().find(t => t.id === user?.id) || user;
const [rejectingId, setRejectingId] = useState<string | null>(null);
const [rejectReason, setRejectReason] = useState('');

const [cancelingId, setCancelingId] = useState<string | null>(null);
const [cancelReason, setCancelReason] = useState('');

const [finishingId, setFinishingId] = useState<string | null>(null);
const [continuityReason, setContinuityReason] = useState('');

const [error, setError] = useState('');

const [selectedAreas, setSelectedAreas] = useState<string[]>(
  currentUserData?.specialties || []
);


const [selectedCourses, setSelectedCourses] = useState<string[]>(
  currentUserData?.courses || []
);




const [courseSchedules, setCourseSchedules] =
  useState<CourseAvailability[]>(
    currentUserData?.courseAvailability || []
  );

const [editingAreas, setEditingAreas] = useState(false);


  const myRequests = requests.filter(r => r.tutorId === user?.id);
  const pendingRequests = myRequests.filter(r => r.status === 'ASSIGNED');
  const activeRequests = myRequests.filter(r => r.status === 'ACCEPTED');

  const handleReject = (id: string) => {
    if (!rejectReason.trim()) {
      setError('Debes especificar un motivo de rechazo.');
      return;
    }
    rejectRequest(id, rejectReason);
    setRejectingId(null);
    setRejectReason('');
    setError('');
  };

  const handleCancel = (id: string) => {
    if (!cancelReason.trim()) {
      setError('Debes especificar el motivo de la cancelación.');
      return;
    }
    cancelRequest(id, cancelReason);
    setCancelingId(null);
    setCancelReason('');
    setError('');
  };

  const handleFinish = (id: string) => {
    finishRequest(id, continuityReason.trim() ? continuityReason : undefined);
    setFinishingId(null);
    setContinuityReason('');
  };

  const toggleArea = (area: string) => {
  setSelectedAreas(prev =>
    prev.includes(area)
      ? prev.filter(a => a !== area)
      : [...prev, area]
  );
};

const toggleCourse = (course: string) => {
  setSelectedCourses(prev =>
    prev.includes(course)
      ? prev.filter(c => c !== course)
      : [...prev, course]
  );
};
const handleSaveAreas = () => {
  if (!user) return;

  updateTutor(
    user.id,
    selectedAreas,
    selectedCourses,
    []
  );

  setEditingAreas(false);
};

const handleSaveCourseSchedules = (schedulesToSave = courseSchedules) => {

  if (!user) return;

  updateCourseAvailability(
    user.id,
    schedulesToSave
  );

};

const handleSaveSchedule = () => {

  if (
    selectedScheduleCourses.length === 0 ||
    configDays.length === 0 ||
    !configStartTime ||
    !configEndTime
  ) {
    return;
  }




  const newSchedule = {
    courses: selectedScheduleCourses,
    days: configDays,
    startTime: configStartTime,
    endTime: configEndTime
  };

  setCourseSchedules(prev => [
    ...prev,
    newSchedule
  ]);

  setSelectedScheduleCourses([]);
  setConfigDays([]);
  setConfigStartTime('');
  setConfigEndTime('');
};

const [selectedScheduleCourses, setSelectedScheduleCourses] =
  useState<string[]>([]);

const [configDays, setConfigDays] =
  useState<string[]>([]);

const [configStartTime, setConfigStartTime] =
  useState('');

const [configEndTime, setConfigEndTime] =
  useState('');

  return (
    <div>
  <h1 className="text-2xl font-bold text-gray-900">
    Dashboard de Tutor
  </h1>

  <div className="mt-2 text-gray-600">
    <div className="flex items-center gap-2 mb-3">
      <span className="font-medium">Especialidades:</span>
    </div>

<div className="bg-white border rounded-xl p-4 mb-6">

  <div className="flex items-center justify-between mb-4">
    <h2 className="font-semibold text-lg">
      Áreas Académicas
    </h2>

    {!editingAreas ? (
      <button
        onClick={() => setEditingAreas(true)}
        className="bg-indigo-600 text-white px-3 py-1 rounded text-sm"
      >
        Editar
      </button>
    ) : (
      <div className="flex gap-2">
        <button
          onClick={handleSaveAreas}
          className="bg-green-600 text-white px-3 py-1 rounded text-sm"
        >
          Guardar
        </button>

        <button
          onClick={() => setEditingAreas(false)}
          className="bg-gray-500 text-white px-3 py-1 rounded text-sm"
        >
          Cancelar
        </button>
      </div>
    )}
  </div>


  {!editingAreas ? (
    <div>
      <p className="text-sm text-gray-600">
        Áreas seleccionadas
      </p>

      <div className="flex flex-wrap gap-2 mt-2">
        {selectedAreas.map(area => (
          <span
            key={area}
            className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-sm"
          >
            {area}
          </span>
        ))}
      </div>

      <p className="text-sm text-gray-600 mt-4">
        Cursos seleccionados
      </p>

      <div className="flex flex-wrap gap-2 mt-2">
        {selectedCourses.map(course => (
          <span
            key={course}
            className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm"
          >
            {course}
          </span>
        ))}
      </div>
    </div>
    


  
  ) : (

    
    
    <div className="space-y-4">

      {Object.entries(academicAreas).map(([area, courses]) => (
        <div
          key={area}
          className="border rounded-lg p-4"
        >
          <label className="flex items-center gap-2 font-medium">
            <input
              type="checkbox"
              checked={selectedAreas.includes(area)}
              onChange={() => toggleArea(area)}
            />
            {area}
          </label>

          {selectedAreas.includes(area) && (
            <div className="ml-6 mt-3 grid md:grid-cols-2 gap-2">

              {courses.map(course => (
                <label
                  key={course}
                  className="flex items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={selectedCourses.includes(course)}
                    onChange={() => toggleCourse(course)}
                  />
                  {course}
                </label>
              ))}

            </div>
          )}
        </div>
      ))}

    </div>
  )}

</div>


<div className="bg-white border rounded-xl p-4 mb-6">

  <h2 className="font-semibold text-lg mb-4">
    Horarios por Curso
  </h2>
<div>
  <p className="font-medium mb-2">
    Cursos para este horario
  </p>

  <div className="grid md:grid-cols-2 gap-2">

    {selectedCourses.map(course => (

      <label
        key={course}
        className="flex items-center gap-2"
      >
        <input
          type="checkbox"
          checked={
            selectedScheduleCourses.includes(course)
          }
          onChange={() => {

            if (
              selectedScheduleCourses.includes(course)
            ) {
              setSelectedScheduleCourses(prev =>
                prev.filter(c => c !== course)
              );
            } else {
              setSelectedScheduleCourses(prev => [
                ...prev,
                course
              ]);
            }

          }}
        />

        {course}

      </label>

    ))}

  </div>
</div>

<div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">

  {[
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes"
  ].map(day => (

    <label
      key={day}
      className="flex items-center gap-2"
    >
      <input
        type="checkbox"
        checked={configDays.includes(day)}
        onChange={() => {

          if (configDays.includes(day)) {
            setConfigDays(
              configDays.filter(d => d !== day)
            );
          } else {
            setConfigDays([
              ...configDays,
              day
            ]);
          }

        }}
      />

      {day}
    </label>

  ))}

</div>
<div className="grid md:grid-cols-2 gap-4 mb-4">

  <div>
    <label className="block text-sm mb-1">
      Desde
    </label>

    <input
      type="time"
      value={configStartTime}
      onChange={(e) =>
        setConfigStartTime(e.target.value)
      }
      className="border rounded px-3 py-2 w-full"
    />
  </div>

  <div>
    <label className="block text-sm mb-1">
      Hasta
    </label>




    <input
      type="time"
      value={configEndTime}
      onChange={(e) =>
        setConfigEndTime(e.target.value)
      }
      className="border rounded px-3 py-2 w-full"
    />
  </div>

</div>
<div className="mt-4">

  <button
    onClick={handleSaveSchedule}
    className="bg-indigo-600 text-white px-4 py-2 rounded"
  >
    Agregar Horario
  </button>

</div>
<div className="mt-6 space-y-3">

{courseSchedules.map((schedule, index) => (

  <div
    key={index}
    className="border rounded-lg p-3"
  >

    <div className="font-medium">
      {schedule.courses.join(", ")}
    </div>

    <div className="text-sm text-gray-600">
      {schedule.days.join(", ")}
    </div>

    <div className="text-sm text-gray-600">
      {schedule.startTime} - {schedule.endTime}
    </div>

    <button
      onClick={() => {
        const updated = courseSchedules.filter((_, i) => i !== index);
        setCourseSchedules(updated);
        handleSaveCourseSchedules(updated);
      }}
      className="bg-red-500 text-white px-2 py-1 rounded text-xs mt-2"
    >
      Eliminar
    </button>

  </div>

))}

<div className="mt-4">
  <button
    onClick={() => handleSaveCourseSchedules()}
    className="bg-green-600 text-white px-4 py-2 rounded"
  >
    Guardar Horarios
  </button>
</div>

</div>
</div>
  </div>


      <div className="grid lg:grid-cols-2 gap-8">
        {/* Nuevas Asignaciones */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Nuevas Asignaciones</h2>
            <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">{pendingRequests.length}</span>
          </div>

          <div className="space-y-4">
            {pendingRequests.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 border-dashed rounded-xl p-8 text-center text-gray-500">
                No tienes solicitudes pendientes por revisar.
              </div>
            ) : (
              pendingRequests.map(req => (
                <div key={req.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-900">{req.subject}</h3>
                    <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded">{req.modality}</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-1">Estudiante: <span className="font-medium text-gray-900">{req.studentName}</span> ({req.career} - Sem {req.semester})</p>

                  
                  <p className="text-gray-700 text-sm mb-5 bg-gray-50 p-3 rounded-lg border border-gray-100">{req.description}</p>

                  {rejectingId === req.id ? (
                    <div className="bg-red-50 p-4 rounded-lg border border-red-100 space-y-3">
                      <label className="block text-sm font-medium text-red-800">Motivo del rechazo (Obligatorio)</label>
                      <textarea
                        className="w-full text-sm border border-red-200 rounded p-2 focus:ring-1 focus:ring-red-500 outline-none"
                        rows={2}
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Ej: Falta de tiempo, tema fuera de mi dominio..."
                      />
                      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
                      <div className="flex gap-2 justify-end">
                        <button 
                          onClick={() => { setRejectingId(null); setRejectReason(''); setError(''); }}
                          className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200 rounded transition-colors"
                        >
                          Atrás
                        </button>
                        <button 
                          onClick={() => handleReject(req.id)}
                          className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        >
                          Confirmar Rechazo
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <button 
                        onClick={() => acceptRequest(req.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                      >
                        <Check className="w-4 h-4" /> Aceptar
                      </button>
                      <button 
                        onClick={() => setRejectingId(req.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-red-200 text-red-600 py-2 rounded-lg font-medium hover:bg-red-50 hover:border-red-300 transition-colors"
                      >
                        <X className="w-4 h-4" /> Rechazar
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* Tutorías Activas */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Tutorías Activas</h2>
            <button className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
              <Users className="w-4 h-4" />
              Crear Grupo
            </button>
          </div>

          <div className="space-y-4">
            {activeRequests.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 border-dashed rounded-xl p-8 text-center text-gray-500">
                No tienes tutorías activas actualmente.
              </div>
            ) : (
              activeRequests.map(req => (
                <div key={req.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col gap-3">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 text-green-600">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{req.subject}</h3>
                      <p className="text-sm text-gray-500 mb-1">Con <span className="font-medium text-gray-800">{req.studentName}</span></p>
                      <div className="flex gap-2">
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">{req.modality}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Asistencia registrada:</span>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={req.attended || false}
                          onChange={(e) => registerAttendance(req.id, e.target.checked)}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-600">Asistió</span>
                      </label>
                    </div>
                  </div>

                  {cancelingId === req.id ? (
                    <div className="bg-red-50 p-3 rounded-lg border border-red-100 space-y-2 mt-2">
                      <p className="text-sm font-medium text-red-800">Motivo de cancelación</p>
                      <textarea
                        className="w-full text-sm border border-red-200 rounded p-2 focus:ring-1 focus:ring-red-500 outline-none"
                        rows={2}
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        placeholder="Ej: Inconveniente de último minuto..."
                      />
                      {error && <p className="text-xs text-red-600">{error}</p>}
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => { setCancelingId(null); setCancelReason(''); setError(''); }} className="text-xs text-gray-600 hover:text-gray-900">Atrás</button>
                        <button onClick={() => handleCancel(req.id)} className="bg-red-600 text-white text-xs px-3 py-1 rounded hover:bg-red-700">Cancelar Tutoría</button>
                      </div>
                    </div>
                  ) : finishingId === req.id ? (
                    <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 space-y-2 mt-2">
                      <p className="text-sm font-medium text-indigo-800">Finalizar Tutoría</p>
                      <label className="text-xs text-indigo-700 flex items-center gap-1"><FileText className="w-3 h-3" /> Motivo de continuidad (Opcional)</label>
                      <textarea
                        className="w-full text-sm border border-indigo-200 rounded p-2 focus:ring-1 focus:ring-indigo-500 outline-none"
                        rows={2}
                        value={continuityReason}
                        onChange={(e) => setContinuityReason(e.target.value)}
                        placeholder="Si necesita continuidad, especifique para qué (ej: para el próximo examen)..."
                      />
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => { setFinishingId(null); setContinuityReason(''); }} className="text-xs text-gray-600 hover:text-gray-900">Atrás</button>
                        <button onClick={() => handleFinish(req.id)} className="bg-indigo-600 text-white text-xs px-3 py-1 rounded hover:bg-indigo-700">Finalizar</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => setFinishingId(req.id)} className="flex-1 flex justify-center items-center gap-1 border border-indigo-600 text-indigo-600 text-sm py-1.5 rounded hover:bg-indigo-50 transition-colors">
                        <CheckSquare className="w-4 h-4" /> Finalizar
                      </button>
                      <button onClick={() => setCancelingId(req.id)} className="flex-1 flex justify-center items-center gap-1 border border-red-200 text-red-600 text-sm py-1.5 rounded hover:bg-red-50 transition-colors">
                        <AlertTriangle className="w-4 h-4" /> Cancelar
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
