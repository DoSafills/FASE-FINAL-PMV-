import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { TutoringRequest, User, CourseAvailability } from './types';

const API = 'http://localhost:3001/api';

interface TutoringContextType {
  users: User[];
  requests: TutoringRequest[];
  createRequest: (req: Omit<TutoringRequest, 'id' | 'status' | 'createdAt' | 'priority'>) => Promise<void>;
  assignTutor: (requestId: string, tutorId: string) => Promise<void>;
  acceptRequest: (requestId: string) => Promise<void>;
  rejectRequest: (requestId: string, reason: string) => Promise<void>;
  cancelRequest: (requestId: string, reason: string) => Promise<void>;
  finishRequest: (requestId: string, continuityReason?: string) => Promise<void>;
  registerAttendance: (requestId: string, attended: boolean) => Promise<void>;
  getTutors: () => User[];
  addTutor: (tutor: Omit<User, 'id' | 'role' | 'joinedAt'>) => Promise<void>;
  updateTutor: (tutorId: string, specialties: string[], courses: string[], availability: { days: string[]; startTime: string; endTime: string }[]) => Promise<void>;
  updateCourseAvailability: (tutorId: string, schedules: CourseAvailability[]) => Promise<void>;
  adminUpdateStatus: (requestId: string, status: TutoringRequest['status']) => Promise<void>;
}

// Mapeo de estados frontend ↔ backend
const toBackend: Record<string, string> = {
  PENDING:           'Pendiente',
  FAILED_AUTO_ASSIGN:'Buscando tutor',
  ASSIGNED:          'Tutor asignado',
  ACCEPTED:          'Programada',
  FINISHED:          'Finalizada',
  REJECTED:          'Rechazada',
  CANCELED:          'Cancelada',
  CONTINUITY:        'Reasignación',
};
const toFrontend: Record<string, string> = Object.fromEntries(
  Object.entries(toBackend).map(([k, v]) => [v, k])
);

// Convierte solicitud de la API al formato del frontend
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
    attended:           s.asistio ?? undefined,
    createdAt:          new Date(s.fecha_solicitud).getTime(),
    priority:           s.prioridad === 'Alta' ? 1 : s.prioridad === 'Media' ? 2 : 3,
  };
}

// Convierte tutor de la API al formato User del frontend
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
      days:      JSON.parse(h.dias ?? '[]'),
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

const TutoringContext = createContext<TutoringContextType | undefined>(undefined);

export function TutoringProvider({ children }: { children: ReactNode }) {
  const [users, setUsers]       = useState<User[]>([]);
  const [requests, setRequests] = useState<TutoringRequest[]>([]);

  // Carga inicial
  useEffect(() => {
    cargarTutores();
    cargarSolicitudes();
  }, []);

  const cargarTutores = async () => {
    try {
      const res  = await fetch(`${API}/tutores`);
      const data = await res.json();

      // Verificar que sea un array antes de hacer .map()
      if (!Array.isArray(data)) {
        console.error('Error: la API no devolvió un array de tutores', data);
        return;
      }

      setUsers((prev) => {
        const noTutores = prev.filter(u => u.role !== 'TUTOR');
        return [...noTutores, ...data.map(mapTutor)];
      });
    } catch (err) {
      console.error('Error cargando tutores:', err);
    }
  };

  const cargarSolicitudes = async () => {
    try {
      const res  = await fetch(`${API}/solicitudes`);
      const data = await res.json();

      // Verificar que sea un array antes de hacer .map()
      if (!Array.isArray(data)) {
        console.error('Error: la API no devolvió un array de solicitudes', data);
        return;
      }

      setRequests(data.map(mapSolicitud));
    } catch (err) {
      console.error('Error cargando solicitudes:', err);
    }
  };
  const getTutors = () => users.filter(u => u.role === 'TUTOR');

  const createRequest = async (reqData: Omit<TutoringRequest, 'id' | 'status' | 'createdAt' | 'priority'>) => {
    let prioridad = 'Baja';
    if (reqData.semester <= 2) prioridad = 'Alta';
    else if (reqData.semester <= 5) prioridad = 'Media';

    await fetch(`${API}/solicitudes`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre_estudiante:      reqData.studentName,
        semestre:               reqData.semester,
        carrera:                reqData.career,
        ramo:                   reqData.subject,
        tema:                   reqData.description,
        prioridad,
        modalidad:              reqData.modality,
        dias_preferidos:        JSON.stringify(reqData.preferredDays),
        hora_inicio_preferida:  reqData.preferredStartTime || null,
        hora_fin_preferida:     reqData.preferredEndTime || null,
        student_id:             reqData.studentId,
      }),
    });
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

  const acceptRequest  = (id: string) => cambiarEstado(id, 'ACCEPTED');
  const rejectRequest  = (id: string, reason: string) => cambiarEstado(id, 'REJECTED', { motivo: reason });
  const cancelRequest  = (id: string, reason: string) => cambiarEstado(id, 'CANCELED', { motivo: reason });

  const finishRequest  = async (id: string, continuityReason?: string) => {
    const estado = continuityReason ? 'CONTINUITY' : 'FINISHED';
    await cambiarEstado(id, estado, continuityReason ? { motivo: continuityReason } : {});
  };

  const registerAttendance = async (requestId: string, attended: boolean) => {
    await fetch(`${API}/solicitudes/${requestId}/asistencia`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ asistio: attended }),
    });
    await cargarSolicitudes();
  };

  const addTutor = async (tutorData: Omit<User, 'id' | 'role' | 'joinedAt'>) => {
    try {
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
    } catch (err) {
      console.error('Error en addTutor:', err);
      throw err; // lo relanza para que el componente pueda mostrar el error
    }
  };

  const updateTutor = async (tutorId: string, specialties: string[], courses: string[], availability: { days: string[]; startTime: string; endTime: string }[]) => {
    // Actualizar especializaciones
    await fetch(`${API}/tutores/${tutorId}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ especializaciones: specialties }),
    });
    // Actualizar cursos
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

  return (
    <TutoringContext.Provider value={{
      users, requests,
      createRequest, assignTutor,
      acceptRequest, rejectRequest, cancelRequest,
      finishRequest, registerAttendance,
      getTutors, addTutor, updateTutor, updateCourseAvailability,
      adminUpdateStatus,
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