import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export type Estado =
  | "Pendiente"
  | "Buscando tutor"
  | "Tutor asignado"
  | "Programada"
  | "Finalizada"
  | "Reasignación"
  | "Rechazada"
  | "Cancelada";

export type Prioridad = "Alta" | "Media" | "Baja";

export interface Solicitud {
  id: number;
  nombreEstudiante: string;
  emailEstudiante: string;
  emailInstitucional: string;
  telefono: string;
  carrera: string;
  semestre: number;
  ramo: string;
  tema: string;
  descripcion: string;
  prioridad: Prioridad;
  estado: Estado;
  tutor?: string;
  tutorId?: number;
  fechaSolicitud: string;
  fechaTutoria?: string;
  horaPreferida?: string;
  asistenciaRegistrada?: boolean;
  asistio?: boolean;
}

export interface Tutor {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  titulo: string;
  anosExperiencia: string;
  disponibilidad: "Alta" | "Media" | "Baja";
  especializaciones: string[];
  horarios: { dia: string; horaInicio: string; horaFin: string }[];
}

export interface Alerta {
  id: number;
  tipo: "urgente" | "advertencia" | "info";
  mensaje: string;
  solicitudId: number;
  fecha: string;
}

export interface Notificacion {
  id: number;
  tipo: "nueva_tutoria" | "mensaje_admin" | "recordatorio";
  titulo: string;
  mensaje: string;
  fecha: string;
  leida: boolean;
  tutorId?: number;
  solicitudId?: number;
}

interface AppContextType {
  solicitudes: Solicitud[];
  tutores: Tutor[];
  alertas: Alerta[];
  notificaciones: Notificacion[];
  agregarSolicitud: (solicitud: Omit<Solicitud, "id" | "estado" | "fechaSolicitud">) => void;
  actualizarEstadoSolicitud: (id: number, estado: Estado, tutorId?: number) => void;
  registrarAsistencia: (id: number, asistio: boolean) => void;
  agregarTutor: (tutor: Omit<Tutor, "id">) => void;
  asignarTutor: (solicitudId: number, tutorId: number) => void;
  marcarNotificacionLeida: (id: number) => void;
  eliminarAlerta: (id: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const solicitudesIniciales: Solicitud[] = [
  {
    id: 1,
    nombreEstudiante: "María González",
    emailEstudiante: "maria.g@gmail.com",
    emailInstitucional: "maria.gonzalez@universidad.cl",
    telefono: "+56 9 1111 1111",
    carrera: "Ingeniería Civil",
    semestre: 3,
    ramo: "Cálculo II",
    tema: "Integrales dobles",
    descripcion: "Necesito ayuda con integrales dobles y triple",
    prioridad: "Alta",
    estado: "Buscando tutor",
    fechaSolicitud: "2026-05-20",
  },
  {
    id: 2,
    nombreEstudiante: "Juan Pérez",
    emailEstudiante: "juan.p@gmail.com",
    emailInstitucional: "juan.perez@universidad.cl",
    telefono: "+56 9 2222 2222",
    carrera: "Ingeniería Informática",
    semestre: 5,
    ramo: "Programación Avanzada",
    tema: "POO y herencia",
    descripcion: "Dudas sobre programación orientada a objetos",
    prioridad: "Media",
    estado: "Programada",
    tutor: "Dr. Carlos Ruiz",
    tutorId: 1,
    fechaSolicitud: "2026-05-19",
    fechaTutoria: "2026-05-25 14:00",
  },
  {
    id: 3,
    nombreEstudiante: "Ana Martínez",
    emailEstudiante: "ana.m@gmail.com",
    emailInstitucional: "ana.martinez@universidad.cl",
    telefono: "+56 9 3333 3333",
    carrera: "Ingeniería Civil",
    semestre: 2,
    ramo: "Álgebra Lineal",
    tema: "Vectores y matrices",
    descripcion: "Ayuda con operaciones de matrices",
    prioridad: "Alta",
    estado: "Finalizada",
    tutor: "Dra. Laura Soto",
    tutorId: 2,
    fechaSolicitud: "2026-05-10",
    fechaTutoria: "2026-05-15 10:00",
    asistenciaRegistrada: true,
    asistio: true,
  },
];

const tutoresIniciales: Tutor[] = [
  {
    id: 1,
    nombre: "Dr. Carlos Ruiz",
    email: "carlos.ruiz@universidad.cl",
    telefono: "+56 9 8888 8888",
    titulo: "Doctor en Ciencias de la Computación",
    anosExperiencia: "10+",
    disponibilidad: "Alta",
    especializaciones: ["Programación", "Algoritmos", "Estructuras de Datos"],
    horarios: [
      { dia: "Lunes", horaInicio: "14:00", horaFin: "18:00" },
      { dia: "Miércoles", horaInicio: "14:00", horaFin: "18:00" },
    ],
  },
  {
    id: 2,
    nombre: "Dra. Laura Soto",
    email: "laura.soto@universidad.cl",
    telefono: "+56 9 9999 9999",
    titulo: "Doctora en Matemáticas",
    anosExperiencia: "5-10",
    disponibilidad: "Media",
    especializaciones: ["Cálculo", "Álgebra", "Matemáticas Discretas"],
    horarios: [
      { dia: "Martes", horaInicio: "10:00", horaFin: "13:00" },
      { dia: "Jueves", horaInicio: "10:00", horaFin: "13:00" },
    ],
  },
];

const alertasIniciales: Alerta[] = [
  {
    id: 1,
    tipo: "advertencia",
    mensaje: "Solicitud pendiente hace 3 días",
    solicitudId: 1,
    fecha: "2026-05-23 10:00",
  },
];

const notificacionesIniciales: Notificacion[] = [
  {
    id: 1,
    tipo: "nueva_tutoria",
    titulo: "Nueva solicitud de tutoría",
    mensaje: "María González solicitó tutoría de Cálculo II",
    fecha: "2026-05-23 09:30",
    leida: false,
    tutorId: 2,
    solicitudId: 1,
  },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>(() => {
    const saved = localStorage.getItem("solicitudes");
    return saved ? JSON.parse(saved) : solicitudesIniciales;
  });

  const [tutores, setTutores] = useState<Tutor[]>(() => {
    const saved = localStorage.getItem("tutores");
    return saved ? JSON.parse(saved) : tutoresIniciales;
  });

  const [alertas, setAlertas] = useState<Alerta[]>(() => {
    const saved = localStorage.getItem("alertas");
    return saved ? JSON.parse(saved) : alertasIniciales;
  });

  const [notificaciones, setNotificaciones] = useState<Notificacion[]>(() => {
    const saved = localStorage.getItem("notificaciones");
    return saved ? JSON.parse(saved) : notificacionesIniciales;
  });

  useEffect(() => {
    localStorage.setItem("solicitudes", JSON.stringify(solicitudes));
  }, [solicitudes]);

  useEffect(() => {
    localStorage.setItem("tutores", JSON.stringify(tutores));
  }, [tutores]);

  useEffect(() => {
    localStorage.setItem("alertas", JSON.stringify(alertas));
  }, [alertas]);

  useEffect(() => {
    localStorage.setItem("notificaciones", JSON.stringify(notificaciones));
  }, [notificaciones]);

  const agregarSolicitud = (solicitudData: Omit<Solicitud, "id" | "estado" | "fechaSolicitud">) => {
    const nuevaSolicitud: Solicitud = {
      ...solicitudData,
      id: Date.now(),
      estado: "Pendiente",
      fechaSolicitud: new Date().toISOString().split("T")[0],
    };

    setSolicitudes((prev) => [...prev, nuevaSolicitud]);

    const nuevaAlerta: Alerta = {
      id: Date.now() + 1,
      tipo: "info",
      mensaje: `Nueva solicitud de ${solicitudData.nombreEstudiante} para ${solicitudData.ramo}`,
      solicitudId: nuevaSolicitud.id,
      fecha: new Date().toISOString(),
    };
    setAlertas((prev) => [...prev, nuevaAlerta]);

    tutores.forEach((tutor) => {
      if (tutor.especializaciones.some((esp) =>
        solicitudData.ramo.toLowerCase().includes(esp.toLowerCase()) ||
        esp.toLowerCase().includes(solicitudData.ramo.toLowerCase())
      )) {
        const nuevaNotificacion: Notificacion = {
          id: Date.now() + tutor.id,
          tipo: "nueva_tutoria",
          titulo: "Nueva solicitud de tutoría",
          mensaje: `${solicitudData.nombreEstudiante} solicitó tutoría de ${solicitudData.ramo}`,
          fecha: new Date().toLocaleString("es-ES"),
          leida: false,
          tutorId: tutor.id,
          solicitudId: nuevaSolicitud.id,
        };
        setNotificaciones((prev) => [...prev, nuevaNotificacion]);
      }
    });
  };

  const actualizarEstadoSolicitud = (id: number, estado: Estado, tutorId?: number) => {
    setSolicitudes((prev) =>
      prev.map((sol) => {
        if (sol.id === id) {
          const tutor = tutorId ? tutores.find((t) => t.id === tutorId) : undefined;
          return {
            ...sol,
            estado,
            tutorId,
            tutor: tutor?.nombre,
          };
        }
        return sol;
      })
    );

    if (estado === "Rechazada") {
      const solicitud = solicitudes.find((s) => s.id === id);
      if (solicitud) {
        const nuevaAlerta: Alerta = {
          id: Date.now(),
          tipo: "urgente",
          mensaje: `Tutoría rechazada: ${solicitud.ramo} - ${solicitud.nombreEstudiante}`,
          solicitudId: id,
          fecha: new Date().toISOString(),
        };
        setAlertas((prev) => [...prev, nuevaAlerta]);
      }
    }

    if (estado === "Tutor asignado" || estado === "Programada") {
      setAlertas((prev) => prev.filter((a) => a.solicitudId !== id));
    }
  };

  const registrarAsistencia = (id: number, asistio: boolean) => {
    setSolicitudes((prev) =>
      prev.map((sol) =>
        sol.id === id
          ? { ...sol, asistenciaRegistrada: true, asistio }
          : sol
      )
    );
  };

  const agregarTutor = (tutorData: Omit<Tutor, "id">) => {
    const nuevoTutor: Tutor = {
      ...tutorData,
      id: Date.now(),
    };
    setTutores((prev) => [...prev, nuevoTutor]);
  };

  const asignarTutor = (solicitudId: number, tutorId: number) => {
    actualizarEstadoSolicitud(solicitudId, "Tutor asignado", tutorId);
  };

  const marcarNotificacionLeida = (id: number) => {
    setNotificaciones((prev) =>
      prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
    );
  };

  const eliminarAlerta = (id: number) => {
    setAlertas((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        solicitudes,
        tutores,
        alertas,
        notificaciones,
        agregarSolicitud,
        actualizarEstadoSolicitud,
        registrarAsistencia,
        agregarTutor,
        asignarTutor,
        marcarNotificacionLeida,
        eliminarAlerta,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext debe usarse dentro de AppProvider");
  }
  return context;
}
