import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { TutoringRequest, User, CourseAvailability, TutoringGroup } from './types';

const API = 'http://localhost:3001/api';

interface TutoringContextType {
  users: User[];
  requests: TutoringRequest[];
  groups: TutoringGroup[];
  createRequest: (req: Omit<TutoringRequest, 'id' | 'status' | 'createdAt' | 'priority'>) => Promise<void>;
  assignTutor: (requestId: string, tutorId: string) => Promise<void>;
  acceptRequest: (requestId: string) => Promise<void>;
  rejectRequest: (requestId: string, reason: string) => Promise<void>;
  cancelRequest: (requestId: string, reason: string) => Promise<void>;
  finishRequest: (requestId: string, continuityReason?: string) => Promise<void>;
  registerAttendance: (requestId: string, attended: boolean) => Promise<void>;
  getTutors: () => (User & { groups?: TutoringGroup[] })[];
  addTutor: (tutor: Omit<User, 'id' | 'role' | 'joinedAt'>) => Promise<void>;
  updateTutor: (tutorId: string, specialties: string[], courses: string[], availability: { days: string[]; startTime: string; endTime: string }[]) => Promise<void>;
  updateCourseAvailability: (tutorId: string, schedules: CourseAvailability[]) => Promise<void>;
  adminUpdateStatus: (requestId: string, status: TutoringRequest['status']) => Promise<void>;
  createGroup: (group: Omit<TutoringGroup, 'id'>) => Promise<void>;
  deleteGroup: (groupId: string) => Promise<void>;
  addStudentToGroup: (groupId: string, studentIds: string[]) => Promise<void>;
  removeStudentFromGroup: (groupId: string, studentId: string) => Promise<void>;
}

const toBackend: Record<string, string> = {
  PENDING:            'Buscando tutor',
  FAILED_AUTO_ASSIGN: 'Buscando tutor',
  ASSIGNED:           'Tutor asignado',
  ACCEPTED:           'Programada',
  FINISHED:           'Finalizada',
  REJECTED:           'Rechazada',
  CANCELED:           'Cancelada',
  CONTINUITY:         'Reasignación',
};
const toFrontend: Record<string, string> = Object.fromEntries(
  Object.entries(toBackend).map(([k, v]) => [v, k])
);

function mapSolicitud(s: any): TutoringRequest {
  return {
    id:                 String(s.id),
    studentId:          s.student_id ?? 'u1',
    studentName:        s.nombre_estudiante,
    career:             s.carrera ?? '',
    semester:           s.semestre,
    subject:            s.ramo,
    description:        s.tema,
    modality:           (s.modalidad as 'ONLINE' | 'PRESENCIAL') ?? 'ONLINE',
    preferredDays:      s.dias_preferidos ? JSON.parse(s.dias_preferidos) : [],
    preferredStartTime: s.hora_inicio_preferida ?? '',
    preferredEndTime:   s.hora_fin_preferida ?? '',
    status:             (toFrontend[s.estado] ?? 'PENDING') as TutoringRequest['status'],
    tutorId:            s.tutor_id ? String(s.tutor_id) : null,
    tutorName:          s.tutor_nombre ?? null,
    rejectionReason:    s.motivo_rechazo ?? undefined,
    cancelReason:       s.motivo_cancelacion ?? undefined,
    continuityReason:   s.motivo_continuidad ?? undefined,
    attended:           s.asistio === 1 ? true : s.asistio === 0 ? false : undefined,
    createdAt:          new Date(s.fecha_solicitud).getTime(),
    priority:           s.prioridad === 'Alta' ? 1 : s.prioridad === 'Media' ? 2 : 3,
  };
}

function mapTutor(t: any): User {
  return {
    id:           String(t.id),
    name:         t.nombre,
    email:        t.email,
    phone:        t.telefono,
    role:         'TUTOR',
    specialties:  t.especializaciones?.map((e: any) => e.nombre) ?? [],
    courses:      t.cursos?.map((c: any) => c.curso) ?? [],
    courseAvailability: t.horarios_curso?.map((h: any) => ({
      courses:   JSON.parse(h.cursos ?? '[]'),
      days:      JSON.parse(h.dias   ?? '[]'),
      startTime: h.hora_inicio,
      endTime:   h.hora_fin,
    })) ?? [],
    availability: t.horarios?.map((h: any) => ({
      days:      [h.dia],
      startTime: h.hora_inicio,
      endTime:   h.hora_fin,
    })) ?? [],
    joinedAt: t.fecha_registro ?? '',
  };
}

function mapGrupo(g: any): TutoringGroup {
  return {
    id:          String(g.id),
    tutorId:     String(g.tutor_id),
    name:        g.nombre,
    course:      g.curso,
    day:         g.dia,
    startTime:   g.hora_inicio,
    endTime:     g.hora_fin,
    room:        g.sala,
    maxStudents: g.cupo_maximo,
    studentIds:  g.studentIds ?? [],
  };
}

const TutoringContext = createContext<TutoringContextType | undefined>(undefined);

export function TutoringProvider({ children }: { children: ReactNode }) {
  const [users, setUsers]       = useState<User[]>([]);
  const [requests, setRequests] = useState<TutoringRequest[]>([]);
  const [groups, setGroups]     = useState<TutoringGroup[]>([]);

  useEffect(() => {
    cargarTutores();
    cargarSolicitudes();
    cargarGrupos();
  }, []);

  const cargarTutores = async () => {
    try {
      const res  = await fetch(`${API}/tutores`);
      const data = await res.json();
      if (!Array.isArray(data)) return;
      setUsers(prev => {
        const noTutores = prev.filter(u => u.role !== 'TUTOR');
        return [...noTutores, ...data.map(mapTutor)];
      });
    } catch (err) { console.error('Error cargando tutores:', err); }
  };

  const cargarSolicitudes = async () => {
    try {
      const res  = await fetch(`${API}/solicitudes`);
      const data = await res.json();
      if (!Array.isArray(data)) return;
      setRequests(data.map(mapSolicitud));
    } catch (err) { console.error('Error cargando solicitudes:', err); }
  };

  const cargarGrupos = async () => {
    try {
      const res  = await fetch(`${API}/grupos`);
      const data = await res.json();
      if (!Array.isArray(data)) return;
      setGroups(data.map(mapGrupo));
    } catch (err) { console.error('Error cargando grupos:', err); }
  };

  const getTutors = () =>
    users
      .filter(u => u.role === 'TUTOR')
      .map(u => ({ ...u, groups: groups.filter(g => g.tutorId === u.id) }));

  const createRequest = async (reqData: Omit<TutoringRequest, 'id' | 'status' | 'createdAt' | 'priority'>) => {
    let prioridad = 'Baja';
    if (reqData.semester <= 2)      prioridad = 'Alta';
    else if (reqData.semester <= 5) prioridad = 'Media';

    const res = await fetch(`${API}/solicitudes`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre_estudiante:     reqData.studentName,
        semestre:              reqData.semester,
        carrera:               reqData.career,
        ramo:                  reqData.subject,
        tema:                  reqData.description,
        prioridad,
        modalidad:             reqData.modality,
        dias_preferidos:       JSON.stringify(reqData.preferredDays),
        hora_inicio_preferida: reqData.preferredStartTime || null,
        hora_fin_preferida:    reqData.preferredEndTime   || null,
        student_id:            reqData.studentId,
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? 'Error al crear solicitud');
    }
    await cargarSolicitudes();
  };

  const cambiarEstado = async (requestId: string, estadoFrontend: string, extra?: object) => {
    await fetch(`${API}/solicitudes/${requestId}/estado`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: toBackend[estadoFrontend], ...extra }),
    });
    await cargarSolicitudes();
  };

  const assignTutor = async (requestId: string, tutorId: string) => {
    await fetch(`${API}/solicitudes/${requestId}/asignar`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tutor_id: Number(tutorId) }),
    });
    await cargarSolicitudes();
  };

  const acceptRequest = (id: string) => cambiarEstado(id, 'ACCEPTED');
  const rejectRequest = (id: string, reason: string) => cambiarEstado(id, 'REJECTED', { motivo: reason });
  const cancelRequest = (id: string, reason: string) => cambiarEstado(id, 'CANCELED', { motivo: reason });
  const finishRequest = (id: string, continuityReason?: string) =>
    cambiarEstado(id, continuityReason ? 'CONTINUITY' : 'FINISHED',
      continuityReason ? { motivo: continuityReason } : {});

  const registerAttendance = async (requestId: string, attended: boolean) => {
    await fetch(`${API}/solicitudes/${requestId}/asistencia`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ asistio: attended }),
    });
    await cargarSolicitudes();
  };

  const addTutor = async (tutorData: Omit<User, 'id' | 'role' | 'joinedAt'>) => {
    const res = await fetch(`${API}/tutores`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre:            tutorData.name,
        email:             tutorData.email,
        telefono:          tutorData.phone ?? '',
        titulo:            '',
        anos_experiencia:  '',
        disponibilidad:    'Media',
        especializaciones: tutorData.specialties ?? [],
        horarios:          [],
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? 'Error al registrar tutor');
    }
    await cargarTutores();
  };

  const updateTutor = async (tutorId: string, specialties: string[], courses: string[], _availability: any[]) => {
    await fetch(`${API}/tutores/${tutorId}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ especializaciones: specialties }),
    });
    await fetch(`${API}/tutores/${tutorId}/cursos`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cursos: courses }),
    });
    await cargarTutores();
  };

  const updateCourseAvailability = async (tutorId: string, schedules: CourseAvailability[]) => {
    await fetch(`${API}/tutores/${tutorId}/horarios-curso`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ horarios_curso: schedules }),
    });
    await cargarTutores();
  };

  const adminUpdateStatus = (requestId: string, status: TutoringRequest['status']) =>
    cambiarEstado(requestId, status);

  // ── Grupos ──────────────────────────────────────────────────
  const createGroup = async (groupData: Omit<TutoringGroup, 'id'>) => {
    await fetch(`${API}/grupos`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tutor_id:    Number(groupData.tutorId),
        nombre:      groupData.name,
        curso:       groupData.course,
        dia:         groupData.day,
        hora_inicio: groupData.startTime,
        hora_fin:    groupData.endTime,
        sala:        groupData.room,
        cupo_maximo: groupData.maxStudents,
      }),
    });
    await cargarGrupos();
  };

  const deleteGroup = async (groupId: string) => {
    await fetch(`${API}/grupos/${groupId}`, { method: 'DELETE' });
    await cargarGrupos();
  };

  const addStudentToGroup = async (groupId: string, studentIds: string[]) => {
    await fetch(`${API}/grupos/${groupId}/estudiantes`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentIds }),
    });
    await cargarGrupos();
  };

  const removeStudentFromGroup = async (groupId: string, studentId: string) => {
    await fetch(`${API}/grupos/${groupId}/estudiantes/${studentId}`, { method: 'DELETE' });
    await cargarGrupos();
  };

  return (
    <TutoringContext.Provider value={{
      users, requests, groups,
      createRequest, assignTutor,
      acceptRequest, rejectRequest, cancelRequest,
      finishRequest, registerAttendance,
      getTutors, addTutor, updateTutor, updateCourseAvailability,
      adminUpdateStatus,
      createGroup, deleteGroup, addStudentToGroup, removeStudentFromGroup,
    }}>
      {children}
    </TutoringContext.Provider>
  );
}

export function useTutoring() {
  const context = useContext(TutoringContext);
  if (!context) throw new Error('useTutoring must be used within a TutoringProvider');
  return context;
}