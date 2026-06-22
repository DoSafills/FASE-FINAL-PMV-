import { useState } from 'react';
import { academicAreas } from '../../data/academicAreas';
import { useAuth } from '../../context/AuthContext';
import { useTutoring } from '../../context/TutoringContext';
import { Check, X, BookOpen, Edit2, CheckSquare, FileText, AlertTriangle, Users, ChevronDown, ChevronUp } from 'lucide-react';
import {
  User,
  CourseAvailability
} from '../../context/types';


export function TutorDashboard() {
  const { user } = useAuth();
  
  const {
  users,
  requests,
  groups,
  createGroup,
  deleteGroup,
  
  removeStudentFromGroup,

  acceptRequest,
  rejectRequest,
  cancelRequest,
  finishRequest,
  registerAttendance,
  getTutors,
  updateTutor,
  updateCourseAvailability,
  addStudentToGroup
} = useTutoring();


  const currentUserData = getTutors().find(t => t.id === String(user?.tutorId)) || user;
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

const [selectedStudents, setSelectedStudents] =
  useState<string[]>([]);


const [courseSchedules, setCourseSchedules] =
  useState<CourseAvailability[]>(
    currentUserData?.courseAvailability || []
  );
const [groupName, setGroupName] = useState('');

const [groupCourse, setGroupCourse] = useState('');

const [groupDay, setGroupDay] = useState('');

const [groupStartTime, setGroupStartTime] = useState('');

const [groupEndTime, setGroupEndTime] = useState('');

const [groupRoom, setGroupRoom] = useState('');

const [groupMaxStudents, setGroupMaxStudents] =
  useState(5);

const [editingAreas, setEditingAreas] = useState(false);


  const myRequests = requests.filter(r => r.tutorId === String(user?.tutorId));
  const pendingRequests = myRequests.filter(r => r.status === 'ASSIGNED');
  const activeRequests = myRequests.filter(r => r.status === 'ACCEPTED');

  const myGroups = groups.filter(
    g => g.tutorId === String(user?.tutorId)
  );


const [selectedGroupId, setSelectedGroupId] =
  useState('');

const [showPendingRequests, setShowPendingRequests] = useState(true);
const [showActiveRequests, setShowActiveRequests] = useState(true);
const [showGroupsPanel, setShowGroupsPanel] = useState(true);
const [showCompatibleStudents, setShowCompatibleStudents] = useState(true);
const [requestSearchPending, setRequestSearchPending] = useState('');
const [filterStartTimePending, setFilterStartTimePending] = useState('');
const [filterEndTimePending, setFilterEndTimePending] = useState('');
const [requestSearchActive, setRequestSearchActive] = useState('');
const [filterStartTimeActive, setFilterStartTimeActive] = useState('');
const [filterEndTimeActive, setFilterEndTimeActive] = useState('');

const compatibleStudents =
  activeRequests.filter(request => {

    if (
      groupCourse &&
      request.subject !== groupCourse
    ) {
      return false;
    }

    if (
      groupDay &&
      !request.preferredDays.includes(groupDay)
    ) {
      return false;
    }

    return true;
  });

const acceptedStudents =
  myRequests.filter(
    r => r.status === "ACCEPTED"
  );

const selectedGroup = myGroups.find(
  group => group.id === selectedGroupId
);

const toMinutes = (time: string) => {
  if (!time) return 0;
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const requestMatchesFilter = (req: typeof myRequests[number], search: string) => {
  const normalizedSearch = search.trim().toLowerCase();
  if (!normalizedSearch) return true;
  return [req.studentName, req.subject, req.career].some(value =>
    value.toLowerCase().includes(normalizedSearch)
  );
};

const requestMatchesTime = (
  req: typeof myRequests[number],
  start: string,
  end: string
) => {
  if (!start && !end) return true;
  const reqStart = toMinutes(req.preferredStartTime);
  const reqEnd = toMinutes(req.preferredEndTime);
  if (start && reqEnd < toMinutes(start)) return false;
  if (end && reqStart > toMinutes(end)) return false;
  return true;
};

const filteredPendingRequests = pendingRequests.filter(
  req =>
    requestMatchesFilter(req, requestSearchPending) &&
    requestMatchesTime(req, filterStartTimePending, filterEndTimePending)
);

const filteredActiveRequests = activeRequests.filter(
  req =>
    requestMatchesFilter(req, requestSearchActive) &&
    requestMatchesTime(req, filterStartTimeActive, filterEndTimeActive)
);

const compatibleStudentsForSelectedGroup = selectedGroup
  ? compatibleStudents.filter(
      student => student.subject === selectedGroup.course
    )
  : compatibleStudents;

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
    String(user.tutorId),
    selectedAreas,
    selectedCourses,
    []
  );
  setEditingAreas(false);
};

const handleSaveCourseSchedules = () => {

  if (!user) return;

  updateCourseAvailability(
    String(user.tutorId),
    courseSchedules
  );

};

const handleCreateGroup = () => {

  if (
    !groupName ||
    !groupCourse ||
    !groupDay ||
    !groupStartTime ||
    !groupEndTime ||
    !groupRoom
  ) {
    return;
  }

createGroup({
  tutorId: String(user!.tutorId),

  name: groupName,

  course: groupCourse,

  day: groupDay,

  startTime: groupStartTime,

  endTime: groupEndTime,

  room: groupRoom,

  maxStudents: groupMaxStudents,

  studentIds: []
});
  setGroupName('');
  setGroupCourse('');
  setGroupDay('');
  setGroupStartTime('');
  setGroupEndTime('');
  setGroupRoom('');
  setSelectedStudents([]);
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

  const timeToMinutes = (
  time: string
) => {

  const [hours, minutes] =
    time.split(':').map(Number);

  return (hours * 60) + minutes;

};

const getCompatibleStudents = (
  group: typeof myGroups[number]
) => {

  const groupStart =
    timeToMinutes(group.startTime);

  const groupEnd =
    timeToMinutes(group.endTime);

  return acceptedStudents
    .filter(student => {

      if (student.subject !== group.course) {
        return false;
      }

      const sameDay =
        student.preferredDays.includes(
          group.day
        );

      if (!sameDay) {
        return false;
      }

      const studentStart =
        timeToMinutes(
          student.preferredStartTime
        );

      const studentEnd =
        timeToMinutes(
          student.preferredEndTime
        );

      const overlapStart =
        Math.max(
          groupStart,
          studentStart
        );

      const overlapEnd =
        Math.min(
          groupEnd,
          studentEnd
        );

      const overlap =
        overlapEnd - overlapStart;

      return overlap >= 60;

    })
    .sort(
      (a, b) =>
        a.semester - b.semester
    );



};

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
      onClick={() =>
        setCourseSchedules(prev =>
          prev.filter((_, i) => i !== index)
        )
      }
      className="bg-red-500 text-white px-2 py-1 rounded text-xs mt-2"
    >
      Eliminar
    </button>

  </div>

))}

<div className="mt-4">
  <button
    onClick={handleSaveCourseSchedules}
    className="bg-green-600 text-white px-4 py-2 rounded"
  >
    Guardar Horarios
  </button>
</div>

</div>
</div>
  </div>


      <div className="grid lg:grid-cols-2 gap-8">
        {/* Nuevas Asignaciones (simplificado temporalmente) */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-gray-900">Nuevas Asignaciones</h2>
              <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">{pendingRequests.length}</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3 mb-4">
              <input
                type="text"
                value={requestSearchPending}
                onChange={e => setRequestSearchPending(e.target.value)}
                placeholder="Buscar por nombre o curso"
                className="border rounded px-3 py-2 w-full md:col-span-2"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="time"
                  value={filterStartTimePending}
                  onChange={e => setFilterStartTimePending(e.target.value)}
                  className="border rounded px-3 py-2 w-full"
                />
                <input
                  type="time"
                  value={filterEndTimePending}
                  onChange={e => setFilterEndTimePending(e.target.value)}
                  className="border rounded px-3 py-2 w-full"
                />
              </div>
            </div>

            {filteredPendingRequests.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 border-dashed rounded-xl p-8 text-center text-gray-500">
                No hay nuevas asignaciones.
              </div>
            ) : (
              filteredPendingRequests.map(req => (
                <div key={req.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{req.subject}</div>
                    <div className="text-sm text-gray-600">{req.studentName} · {req.career}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { acceptRequest(req.id); }} className="text-white bg-green-600 px-3 py-1 rounded">Aceptar</button>
                    <button onClick={() => setRejectingId(req.id)} className="text-red-600 border border-red-200 px-3 py-1 rounded">Rechazar</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Tutorías Activas (simplificado temporalmente) */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-gray-900">Tutorías Activas</h2>
              <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">{activeRequests.length}</span>
            </div>
            <button
              onClick={() => setShowActiveRequests(v => !v)}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              {showActiveRequests ? 'Ocultar' : 'Mostrar'} <ChevronUp className="w-4 h-4" />
            </button>
          </div>

          {showActiveRequests && (
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3 mb-4">
                <input
                  type="text"
                  value={requestSearchActive}
                  onChange={e => setRequestSearchActive(e.target.value)}
                  placeholder="Buscar por nombre o curso"
                  className="border rounded px-3 py-2 w-full md:col-span-2"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="time"
                    value={filterStartTimeActive}
                    onChange={e => setFilterStartTimeActive(e.target.value)}
                    className="border rounded px-3 py-2 w-full"
                  />
                  <input
                    type="time"
                    value={filterEndTimeActive}
                    onChange={e => setFilterEndTimeActive(e.target.value)}
                    className="border rounded px-3 py-2 w-full"
                  />
                </div>
              </div>

              {filteredActiveRequests.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 border-dashed rounded-xl p-8 text-center text-gray-500">
                  No hay tutorías activas que coincidan.
                </div>
              ) : (
                filteredActiveRequests.map(req => (
                  <div key={req.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold">{req.subject}</div>
                        <div className="text-sm text-gray-500">Con {req.studentName}</div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setFinishingId(req.id)} className="text-indigo-600">Finalizar</button>
                        <button onClick={() => setCancelingId(req.id)} className="text-red-600">Cancelar</button>
                      </div>
                    </div>

                    {finishingId === req.id && (
                      <div className="mt-3 bg-indigo-50 p-3 rounded">
                        <label className="text-sm font-medium text-indigo-700">Comentario de continuidad (opcional)</label>
                        <textarea
                          value={continuityReason}
                          onChange={e => setContinuityReason(e.target.value)}
                          className="w-full mt-2 border rounded p-2"
                          rows={2}
                        />
                        <div className="flex justify-end gap-2 mt-2">
                          <button onClick={() => { setFinishingId(null); setContinuityReason(''); }} className="px-3 py-1 text-sm">Cancelar</button>
                          <button onClick={() => handleFinish(req.id)} className="px-3 py-1 bg-indigo-600 text-white rounded text-sm">Confirmar</button>
                        </div>
                      </div>
                    )}

                    {cancelingId === req.id && (
                      <div className="mt-3 bg-red-50 p-3 rounded">
                        <label className="text-sm font-medium text-red-700">Motivo de cancelación</label>
                        <textarea
                          value={cancelReason}
                          onChange={e => setCancelReason(e.target.value)}
                          className="w-full mt-2 border rounded p-2"
                          rows={2}
                        />
                        {error && <div className="text-sm text-red-600 mt-1">{error}</div>}
                        <div className="flex justify-end gap-2 mt-2">
                          <button onClick={() => { setCancelingId(null); setCancelReason(''); setError(''); }} className="px-3 py-1 text-sm">Atrás</button>
                          <button onClick={() => handleCancel(req.id)} className="px-3 py-1 bg-red-600 text-white rounded text-sm">Cancelar Tutoría</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </section>
      </div>
<div className="bg-white border rounded-xl p-4 mb-6">

  <h2 className="text-xl font-semibold mb-4">
    Grupos de Tutoría
  </h2>

  <div className="grid md:grid-cols-2 gap-3">

    <input
      type="text"
      placeholder="Nombre del grupo"
      value={groupName}
      onChange={(e) => setGroupName(e.target.value)}
      className="border rounded px-3 py-2"
    />

    <select
      value={groupCourse}
      onChange={(e) => setGroupCourse(e.target.value)}
      className="border rounded px-3 py-2"
    >
      <option value="">
        Seleccionar curso
      </option>

      {selectedCourses.map(course => (
        <option
          key={course}
          value={course}
        >
          {course}
        </option>
      ))}
    </select>

    <select
      value={groupDay}
      onChange={(e) => setGroupDay(e.target.value)}
      className="border rounded px-3 py-2"
    >
      <option value="">
        Seleccionar día
      </option>

      <option value="Lunes">Lunes</option>
      <option value="Martes">Martes</option>
      <option value="Miércoles">Miércoles</option>
      <option value="Jueves">Jueves</option>
      <option value="Viernes">Viernes</option>
    </select>

    <input
      type="text"
      placeholder="Sala"
      value={groupRoom}
      onChange={(e) => setGroupRoom(e.target.value)}
      className="border rounded px-3 py-2"
    />
<input
  type="number"
  min="1"
  value={groupMaxStudents}
  onChange={(e) =>
    setGroupMaxStudents(
      Number(e.target.value)
    )
  }
  className="border rounded px-3 py-2"
  placeholder="Cupo máximo"
/>
    <input
      type="time"
      value={groupStartTime}
      onChange={(e) =>
        setGroupStartTime(e.target.value)
      }
      className="border rounded px-3 py-2"
    />

    <input
      type="time"
      value={groupEndTime}
      onChange={(e) =>
        setGroupEndTime(e.target.value)
      }
      className="border rounded px-3 py-2"
    />

  </div>
<div className="mt-4">

  <h3 className="font-medium mb-2">
    Estudiantes compatibles
  </h3>

  <div className="mb-4 space-y-2">
    <select
      value={selectedGroupId}
      onChange={(e) =>
        setSelectedGroupId(e.target.value)
      }
      className="border rounded px-3 py-2 w-full"
    >
      <option value="">
        Seleccionar grupo
      </option>
      {myGroups.map(group => (
        <option
          key={group.id}
          value={group.id}
        >
          {group.name}
        </option>
      ))}
    </select>

    <button
      onClick={() => {
        if (
          !selectedGroupId ||
          selectedStudents.length === 0
        ) {
          return;
        }

        addStudentToGroup(
          selectedGroupId,
          selectedStudents
        );

        setSelectedStudents([]);
      }}
      className="bg-blue-600 text-white px-4 py-2 rounded"
    >
      Agregar al Grupo
    </button>
  </div>

  <div className="space-y-2">
    {compatibleStudentsForSelectedGroup.map(student => (
      <label
        key={student.studentId}
        className="flex items-center gap-2 border rounded p-2"
      >
        <input
          type="checkbox"
          checked={
            selectedStudents.includes(
              student.studentId
            )
          }
          onChange={() => {
            if (
              selectedStudents.includes(
                student.studentId
              )
            ) {
              setSelectedStudents(prev =>
                prev.filter(
                  id => id !== student.studentId
                )
              );
            } else {
              setSelectedStudents(prev => [
                ...prev,
                student.studentId
              ]);
            }
          }}
        />

        <div>
          <div className="font-medium">
            {student.studentName}
          </div>

          <div className="text-sm text-gray-600">
            Semestre {student.semester}
          </div>

          <div className="text-sm text-gray-500">
            {student.subject}
          </div>
        </div>
      </label>
    ))}
  </div>

</div>
  <div className="mt-4">
    <button
      onClick={handleCreateGroup}
      className="bg-indigo-600 text-white px-4 py-2 rounded"
    >
      Crear Grupo
    </button>
  </div>

  <div className="mt-4 space-y-3">

    {myGroups.length === 0 ? (

      <div className="text-gray-500 text-sm">
        No tienes grupos creados.
      </div>

    ) : (

      myGroups.map(group => (

        <div
          key={group.id}
          className="border rounded-lg p-4"
        >

          <div className="flex justify-between items-start">

            <div>

              <h3 className="font-semibold">
                {group.name}
              </h3>

              <p className="text-sm text-gray-600">
                Curso: {group.course}
              </p>

              <p className="text-sm text-gray-600">
                Día: {group.day}
              </p>

              <p className="text-sm text-gray-600">
                Horario: {group.startTime} - {group.endTime}
              </p>

              <p className="text-sm text-gray-600">
                Sala: {group.room}
              </p>

              <p className="text-sm text-gray-600">
  Integrantes: {group.studentIds.length}
</p>

<p className="text-sm text-gray-600">
  Capacidad: {group.maxStudents}
</p>

<p className="text-sm text-gray-600">
  Disponibles: {group.maxStudents - group.studentIds.length}
</p>
              
<div className="mt-2">

  <p className="font-medium text-sm">
    Integrantes
  </p>

  {group.studentIds.map(studentId => {
    const studentRequest = requests.find(r => r.studentId === studentId);
    if (!studentRequest) return null;

    const studentUser = users.find(u => u.id === studentId);

    return (
      <div key={studentId} className="border rounded p-2 mt-1 flex justify-between items-center">
        <div>
          <div className="font-medium">{studentRequest.studentName}</div>
          <div className="text-sm text-gray-600">Semestre {studentRequest.semester}</div>
          <div className="text-sm text-blue-600">{studentUser?.email || "Sin correo"}</div>
        </div>

        <button
          onClick={() => removeStudentFromGroup(group.id, studentId)}
          className="bg-red-500 text-white px-2 py-1 rounded text-xs"
        >
          Quitar
        </button>
      </div>
    );
  })}

</div>
            </div>

            <button
              onClick={() => deleteGroup(group.id)}
              className="bg-red-500 text-white px-3 py-1 rounded text-sm"
            >
              Eliminar
            </button>

          </div>

        </div>

      ))

    )}

  </div>

</div>
</div>
  );
}
