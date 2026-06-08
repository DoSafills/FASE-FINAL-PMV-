import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { useTutoring } from '../../context/TutoringContext';
import { PlusCircle, Clock, CheckCircle, XCircle, AlertCircle, BookOpen, Info, Phone, Mail, FileText, Check } from 'lucide-react';
import { RequestStatus } from '../../context/types';

export function StudentDashboard() {
  const { user } = useAuth();
  const { requests, getTutors } = useTutoring();
  const navigate = useNavigate();
  const [showStatusInfo, setShowStatusInfo] = useState(false);

  const myRequests = requests.filter(r => r.studentId === user?.id);
  const tutors = getTutors();

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'PENDING':
      case 'FAILED_AUTO_ASSIGN':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3" /> Buscando Tutor</span>;
      case 'ASSIGNED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><AlertCircle className="w-3 h-3" /> Asignado</span>;
      case 'ACCEPTED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3" /> Aceptada</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3" /> Rechazada</span>;
      case 'CANCELED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"><XCircle className="w-3 h-3" /> Cancelada</span>;
      case 'FINISHED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"><Check className="w-3 h-3" /> Finalizada</span>;
      case 'CONTINUITY':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"><FileText className="w-3 h-3" /> Continuidad</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Mis Solicitudes</h1>
            <button 
              onClick={() => setShowStatusInfo(!showStatusInfo)}
              className="text-gray-400 hover:text-indigo-600 transition-colors"
              title="¿Qué significa cada estado?"
            >
              <Info className="w-5 h-5" />
            </button>
          </div>
          <p className="text-gray-500 mt-1">Gestiona tus tutorías solicitadas</p>
        </div>
        <button
          onClick={() => navigate('/student/request')}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          <PlusCircle className="w-5 h-5" />
          Nueva Solicitud
        </button>
      </div>

      {showStatusInfo && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-900 mb-6">
          <h4 className="font-bold mb-2">Guía de estados de tutoría:</h4>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <li><span className="font-semibold text-yellow-700">Buscando Tutor:</span> El sistema o el encargado está buscando un profesor ideal.</li>
            <li><span className="font-semibold text-blue-700">Asignado:</span> Se ha asignado un tutor, pero aún debe confirmar si acepta.</li>
            <li><span className="font-semibold text-green-700">Aceptada:</span> El tutor aceptó. Ya puedes ver sus datos de contacto.</li>
            <li><span className="font-semibold text-red-700">Rechazada:</span> El tutor no pudo aceptar. Se buscará a alguien más.</li>
            <li><span className="font-semibold text-gray-700">Cancelada:</span> La tutoría fue cancelada (verás el motivo).</li>
            <li><span className="font-semibold text-indigo-700">Finalizada:</span> La tutoría se realizó con éxito.</li>
            <li><span className="font-semibold text-purple-700">Continuidad:</span> Necesitas más sesiones. Queda en cola de espera.</li>
          </ul>
        </div>
      )}

      {myRequests.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No hay solicitudes</h3>
          <p className="text-gray-500 mb-4">Aún no has solicitado ninguna tutoría.</p>
          <button
            onClick={() => navigate('/student/request')}
            className="text-indigo-600 font-medium hover:text-indigo-700"
          >
            Crear la primera →
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {myRequests.map(req => {
            const tutorDetails = req.tutorId ? tutors.find(t => t.id === req.tutorId) : null;
            
            return (
            <div key={req.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{req.modality}</span>
                {getStatusBadge(req.status)}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">{req.subject}</h3>
              <p className="text-xs text-gray-500 mb-2">{req.career} - Semestre {req.semester}</p>
              <p className="text-sm text-gray-600 line-clamp-3 mb-2 flex-grow">{req.description}</p>
              <p className="text-xs font-medium text-indigo-600 mb-4 bg-indigo-50 px-2 py-1 rounded inline-block self-start"> Horario pref: {req.preferredDays?.join(', ')} {req.preferredStartTime} - {req.preferredEndTime}</p>
              
              <div className="pt-4 border-t border-gray-100 text-sm">
                {req.tutorName ? (
                  <p className="text-gray-700">Tutor: <span className="font-medium">{req.tutorName}</span></p>
                ) : (
                  <p className="text-gray-400 italic">Tutor no asignado</p>
                )}
                
                {req.status === 'ACCEPTED' && tutorDetails && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-2">
                    <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Contacto del Tutor</p>
                    <div className="flex items-center gap-2 text-gray-600 text-xs">
                      <Mail className="w-3 h-3" />
                      <span>{tutorDetails.email}</span>
                    </div>
                    {tutorDetails.phone && (
                      <div className="flex items-center gap-2 text-gray-600 text-xs">
                        <Phone className="w-3 h-3" />
                        <span>{tutorDetails.phone}</span>
                      </div>
                    )}
                  </div>
                )}

                {req.status === 'REJECTED' && req.rejectionReason && (
                  <div className="mt-3 p-3 bg-red-50 rounded-md">
                    <p className="text-xs font-medium text-red-800 mb-1">Motivo del rechazo:</p>
                    <p className="text-xs text-red-600">{req.rejectionReason}</p>
                  </div>
                )}
                {req.status === 'CANCELED' && req.cancelReason && (
                  <div className="mt-3 p-3 bg-gray-100 rounded-md">
                    <p className="text-xs font-medium text-gray-800 mb-1">Motivo de cancelación:</p>
                    <p className="text-xs text-gray-600">{req.cancelReason}</p>
                  </div>
                )}
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


