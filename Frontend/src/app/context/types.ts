export type Role = 'ESTUDIANTE' | 'TUTOR' | 'ENCARGADO';

export interface TutorAvailability {
  days: string[];
  startTime: string;
  endTime: string;
}


export interface CourseAvailability {
  courses: string[];
  days: string[];
  startTime: string;
  endTime: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;

  specialties?: string[];
  courses?: string[];

  courseAvailability?: CourseAvailability[];

availability?: {
  days: string[];
  startTime: string;
  endTime: string;
}[];

  joinedAt?: string;
  semester?: number;
}

export interface TutoringGroup {

  id: string;

  tutorId: string;

  name: string;

  course: string;

  day: string;

  startTime: string;

  endTime: string;

  room: string;

  maxStudents: number;

  studentIds: string[];

}

export type RequestStatus = 'PENDING' | 'ASSIGNED' | 'ACCEPTED' | 'REJECTED' | 'FAILED_AUTO_ASSIGN' | 'FINISHED' | 'CANCELED' | 'CONTINUITY';

export interface TutoringRequest {
  id: string;
  studentId: string;
  studentName: string;
  career: string;
  semester: number;
  subject: string;
  description: string;
  modality: 'ONLINE' | 'PRESENCIAL';
  preferredDays: string[];

  preferredStartTime: string;
  preferredEndTime: string;
  status: RequestStatus;
  tutorId?: string | null;
  tutorName?: string | null;
  rejectionReason?: string;
  cancelReason?: string;
  continuityReason?: string;
  attended?: boolean; // registered by tutor
  createdAt: number;
  priority: number; // calculated priority, lower number = higher priority
}

export const MOCK_USERS: User[] = [

  {
    id: 'u1',
    name: 'Ana Estudiante',
    email: 'ana@uni.edu',
    role: 'ESTUDIANTE',
    semester: 1
  },

  {
    id: 'u2',
    name: 'Carlos Estudiante',
    email: 'carlos@uni.edu',
    role: 'ESTUDIANTE',
    semester: 4
  },

  {
    id: 't1',
    name: 'Prof. Martínez',
    email: 'martinez@uni.edu',
    role: 'TUTOR',

    specialties: ['Matemáticas'],

    courses: [
      'Álgebra',
      'Introducción a la Matemática',
      'Tópicos para la Matemática',
      'Cálculo I'
    ],

    availability: [
      {
        days: ['Lunes', 'Miércoles'],
        startTime: '14:00',
        endTime: '18:00'
      }
    ],

    joinedAt: '2022-03-15'
  },

  {
    id: 't2',
    name: 'Prof. Gómez',
    email: 'gomez@uni.edu',
    role: 'TUTOR',

    specialties: ['Programación'],

    courses: [
      'Introducción a la Programación',
      'Programación I',
      'Programación II',
      'Estructura de Datos'
    ],

    availability: [
      {
        days: ['Martes', 'Jueves'],
        startTime: '09:00',
        endTime: '13:00'
      }
    ],

    joinedAt: '2023-08-10'
  },

  {
    id: 'a1',
    name: 'Admin Principal',
    email: 'admin@uni.edu',
    role: 'ENCARGADO'
  }

];
