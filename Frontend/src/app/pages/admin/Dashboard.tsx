import { useState } from 'react';
import { useTutoring } from '../../context/TutoringContext';
import { RequestStatus } from '../../context/types';
import { Search, Filter, AlertCircle, UserCheck, Plus, X, Edit } from 'lucide-react';

export function AdminDashboard() {
  const { requests, getTutors, assignTutor, addTutor, adminUpdateStatus } = useTutoring();
  const [filterStatus, setFilterStatus] = useState<RequestStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [assigningId, setAssigningId] = useState<string | null>(null);

  const [showAddTutor, setShowAddTutor] = useState(false);
  const [newTutorName, setNewTutorName] = useState('');
  const [newTutorEmail, setNewTutorEmail] = useState('');
  const [newTutorPhone, setNewTutorPhone] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<RequestStatus>('PENDING');

  const tutors = getTutors();

  const failedRequests = requests.filter(req => req.status === 'FAILED_AUTO_ASSIGN' || req.status === 'REJECTED');
  
  const filteredRequests = requests.filter(req => {
    if (filterStatus !== 'ALL' && req.status !== filterStatus) return false;
    if (search && !req.subject.toLowerCase().includes(search.toLowerCase()) && !req.studentName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getStatusText = (status: RequestStatus) => {
    switch(status) {
      case 'PENDING': return 'Pendiente';
      case 'FAILED_AUTO_ASSIGN': return 'Fallo Auto-asignación';
      case 'ASSIGNED': return 'Asignada a Tutor';
      case 'ACCEPTED': return 'Activa (Aceptada)';
      case 'REJECTED': return 'Rechazada por Tutor';
      case 'CANCELED': return 'Cancelada';
      case 'FINISHED': return 'Finalizada';
      case 'CONTINUITY': return 'Continuidad';
      default: return status;
    }
  };

  const getStatusColor = (status: RequestStatus) => {
    switch(status) {
      case 'FAILED_AUTO_ASSIGN':
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ASSIGNED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ACCEPTED': return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELED': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'FINISHED': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'CONTINUITY': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddTutor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTutorName && newTutorEmail) {
      try {
        await addTutor({ name: newTutorName, email: newTutorEmail, phone: newTutorPhone, specialties: [] });
        setShowAddTutor(false);
        setNewTutorName('');
        setNewTutorEmail('');
        setNewTutorPhone('');
      } catch (err: any) {
        alert(err.message ?? 'Error al registrar tutor');
      }
    }
  };

  const handleSaveEdit = () => {
    if (editingId) {
      adminUpdateStatus(editingId, editStatus);
      setEditingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel de Encargado</h1>
          <p className="text-gray-500 mt-1">Gestión general y asignación manual de tutorías</p>
        </div>
        <button
          onClick={() => setShowAddTutor(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Registrar Tutor
        </button>
      </div>

      {failedRequests.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-lg font-bold text-red-900 flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5" /> Requieren Intervención Manual ({failedRequests.length})
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {failedRequests.map(req => (
              <div key={req.id} className="bg-white rounded-lg p-4 border border-red-100 flex justify-between items-center shadow-sm">
                <div>
                  <h3 className="font-bold text-gray-900">{req.subject}</h3>
                  <p className="text-sm text-gray-500">De: {req.studentName}</p>
                  <p className="text-xs text-red-600 mt-1 font-medium">{getStatusText(req.status)}</p>
                </div>
                <button
                  onClick={() => setAssigningId(req.id)}
                  className="px-3 py-1.5 bg-red-100 text-red-700 text-sm font-medium rounded hover:bg-red-200"
                >
                  Asignar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por asignatura o estudiante..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as RequestStatus | 'ALL')}
            className="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 flex-1"
          >
            <option value="ALL">Todos los estados</option>
            <option value="FAILED_AUTO_ASSIGN">Requieren Atención (Fallo auto)</option>
            <option value="REJECTED">Requieren Atención (Rechazadas)</option>
            <option value="PENDING">Pendientes</option>
            <option value="ASSIGNED">Asignadas</option>
            <option value="ACCEPTED">Activas</option>
            <option value="CANCELED">Canceladas</option>
            <option value="FINISHED">Finalizadas</option>
            <option value="CONTINUITY">Continuidad</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
              <tr>
                <th className="px-6 py-4 font-semibold">Estudiante (Semestre)</th>
                <th className="px-6 py-4 font-semibold">Asignatura</th>
                <th className="px-6 py-4 font-semibold">Estado</th>
                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No se encontraron solicitudes con los filtros actuales.
                  </td>
                </tr>
              ) : (
                filteredRequests.map(req => (
                  <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{req.studentName}</p>
                      <p className="text-xs text-gray-500 mt-1 truncate max-w-[200px]" title={req.description}>Semestre {req.semester} - Pri: {req.priority}</p>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {req.subject}
                      <span className="block text-xs font-normal text-gray-500 mt-1 bg-gray-100 inline-block px-2 py-0.5 rounded">{req.modality}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`text-xs font-medium px-2 py-1 rounded border ${getStatusColor(req.status)}`}>
                          {getStatusText(req.status)}
                        </span>
                        {req.tutorName && (
                          <span className="text-xs text-gray-600">Tutor: {req.tutorName}</span>
                        )}
                        {req.status === 'REJECTED' && req.rejectionReason && (
                          <span className="text-[10px] text-red-600 mt-1 max-w-[150px] truncate" title={req.rejectionReason}>
                            Motivo: {req.rejectionReason}
                          </span>
                        )}
                        {req.status === 'CANCELED' && req.cancelReason && (
                          <span className="text-[10px] text-gray-600 mt-1 max-w-[150px] truncate">
                            Motivo: {req.cancelReason}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {['FAILED_AUTO_ASSIGN', 'REJECTED', 'PENDING', 'ASSIGNED'].includes(req.status) && (
                          <button
                            onClick={() => setAssigningId(assigningId === req.id ? null : req.id)}
                            className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded transition-colors"
                          >
                            <UserCheck className="w-3 h-3" /> 
                            {req.tutorId ? 'Reasignar' : 'Asignar'}
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setEditingId(req.id);
                            setEditStatus(req.status);
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                          title="Modificar Estado Manualmente"
                        >
                          <Edit className="w-3 h-3" /> Modificar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Assignment Modal */}
      {assigningId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-xl">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Asignar Tutor Manualmente</h2>
              <button onClick={() => setAssigningId(null)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
            </div>
            
            <div className="p-6 overflow-y-auto bg-gray-50">
              <div className="grid gap-4">
                {tutors.map(tutor => (
                  <div key={tutor.id} className="bg-white p-4 rounded-lg border border-gray-200 flex justify-between items-center shadow-sm hover:border-indigo-200 transition-colors">
                    <div>
                      <h4 className="font-bold text-gray-900">{tutor.name}</h4>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {tutor.specialties?.length ? tutor.specialties.map(s => (
                          <span key={s} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100">{s}</span>
                        )) : <span className="text-xs text-gray-400">Sin especialidades</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        assignTutor(assigningId, tutor.id);
                        setAssigningId(null);
                      }}
                      className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 transition-colors"
                    >
                      Asignar
                    </button>
                  </div>
                ))}
                {tutors.length === 0 && <p className="text-gray-500 text-center">No hay tutores registrados.</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modify Request Modal */}
      {editingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Modificar Estado</h2>
              <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
            </div>
            <p className="text-sm text-gray-500 mb-4">Cambia el estado de la tutoría forzosamente. Úsalo con precaución.</p>
            <select
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value as RequestStatus)}
              className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 mb-6"
            >
              <option value="PENDING">Pendiente</option>
              <option value="CANCELED">Cancelada</option>
              <option value="FINISHED">Finalizada</option>
            </select>
            <div className="flex justify-end gap-2">
              <button onClick={() => setEditingId(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
              <button onClick={handleSaveEdit} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Tutor Modal */}
      {showAddTutor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Registrar Nuevo Tutor</h2>
              <button onClick={() => setShowAddTutor(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
            </div>
            <form onSubmit={handleAddTutor} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                <input required type="text" value={newTutorName} onChange={e => setNewTutorName(e.target.value)} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo (Para login)</label>
                <input required type="email" value={newTutorEmail} onChange={e => setNewTutorEmail(e.target.value)} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono (Opcional)</label>
                <input type="text" value={newTutorPhone} onChange={e => setNewTutorPhone(e.target.value)} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <p className="text-xs text-gray-500 mt-2">El tutor podrá configurar sus especialidades desde su propio panel una vez inicie sesión.</p>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setShowAddTutor(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Registrar Tutor</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
