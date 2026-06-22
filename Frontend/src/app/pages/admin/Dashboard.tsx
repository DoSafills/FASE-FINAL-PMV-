import { useState } from 'react';
import { useTutoring } from '../../context/TutoringContext';
import { RequestStatus } from '../../context/types';
import { Search, Filter, AlertCircle, UserCheck, Plus, Edit } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function AdminDashboard() {
	const { token } = useAuth();
	const { requests, getTutors, assignTutor, addTutor, adminUpdateStatus } = useTutoring();
	const [filterStatus, setFilterStatus] = useState<RequestStatus | 'ALL'>('ALL');
	const [search, setSearch] = useState('');
	const [tutorSearch, setTutorSearch] = useState('');
	const [assigningId, setAssigningId] = useState<string | null>(null);
	const [semesterFilter, setSemesterFilter] = useState<number | 'ALL'>('ALL');

	const [showAddTutor, setShowAddTutor] = useState(false);
	const [newTutorName, setNewTutorName] = useState('');
	const [newTutorEmail, setNewTutorEmail] = useState('');
	const [newTutorPhone, setNewTutorPhone] = useState('');
	const [newTutorPassword, setNewTutorPassword] = useState('');
	const [tutorError, setTutorError] = useState('');

	const [editingId, setEditingId] = useState<string | null>(null);
	const [editStatus, setEditStatus] = useState<RequestStatus>('PENDING');

	const tutors = getTutors();
	const [activeTab, setActiveTab] = useState<'solicitudes' | 'tutores'>('solicitudes');

	const matchesTutorSearch = (tutor: any) => {
		if (!tutorSearch.trim()) return true;
		const q = tutorSearch.toLowerCase();
		if (tutor.name?.toLowerCase().includes(q)) return true;
		if (tutor.email?.toLowerCase().includes(q)) return true;
		if (tutor.phone?.toLowerCase().includes(q)) return true;
		if (tutor.specialties?.some((s: string) => s.toLowerCase().includes(q))) return true;
		if (tutor.courses?.some((c: string) => c.toLowerCase().includes(q))) return true;
		if (tutor.groups?.some((g: any) =>
			(g.name?.toLowerCase().includes(q)) ||
			(g.course?.toLowerCase().includes(q)) ||
			(g.day?.toLowerCase().includes(q)) ||
			(g.room?.toLowerCase().includes(q))
		)) return true;
		if (tutor.availability?.some((a: any) =>
			a.days?.some((d: string) => d.toLowerCase().includes(q)) ||
			a.startTime?.toLowerCase().includes(q) ||
			a.endTime?.toLowerCase().includes(q)
		)) return true;
		if (tutor.courseAvailability?.some((a: any) =>
			a.courses?.some((c: string) => c.toLowerCase().includes(q)) ||
			a.days?.some((d: string) => d.toLowerCase().includes(q)) ||
			a.startTime?.toLowerCase().includes(q) ||
			a.endTime?.toLowerCase().includes(q)
		)) return true;
		return false;
	};

	const filteredTutors = tutors.filter(matchesTutorSearch);

	const matchesFilters = (req: any) => {
		if (filterStatus !== 'ALL' && req.status !== filterStatus) return false;
		if (search) {
			const q = search.toLowerCase();
			if (!req.subject?.toLowerCase().includes(q) && !req.studentName?.toLowerCase().includes(q)) return false;
		}
		if (semesterFilter !== 'ALL') {
			const sem = Number(semesterFilter);
			if (!req.semester || Number(req.semester) < sem) return false;
		}
		return true;
	};

	const pendingRequests = requests.filter(req => ['PENDING', 'REJECTED', 'CONTINUITY'].includes(req.status) && matchesFilters(req));
	const activeRequests = requests.filter(req => req.status === 'ACCEPTED' && matchesFilters(req));
	const failedRequests = requests.filter(req => req.status === 'FAILED_AUTO_ASSIGN' && matchesFilters(req));

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
	setTutorError('');

	if (!newTutorName || !newTutorEmail || !newTutorPassword) {
		setTutorError('Nombre, correo y contraseña son obligatorios.');
		return;
	}
	if (newTutorPassword.length < 6) {
		setTutorError('La contraseña debe tener al menos 6 caracteres.');
		return;
	}

	try {
		const res = await fetch('http://localhost:3001/api/auth/crear-tutor', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({
			nombre: newTutorName,
			email: newTutorEmail,
			password: newTutorPassword,
			telefono: newTutorPhone,
		}),
		});
		const data = await res.json();

		if (!res.ok) {
		setTutorError(data.error ?? 'Error al registrar tutor');
		return;
		}

		setShowAddTutor(false);
		setNewTutorName('');
		setNewTutorEmail('');
		setNewTutorPhone('');
		setNewTutorPassword('');
	} catch (err) {
		setTutorError('No se pudo conectar con el servidor.');
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

			<div className="mt-4 flex gap-2">
				<button onClick={() => setActiveTab('solicitudes')} className={`px-3 py-1 rounded ${activeTab==='solicitudes' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}>Solicitudes</button>
				<button onClick={() => setActiveTab('tutores')} className={`px-3 py-1 rounded ${activeTab==='tutores' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}>Tutores</button>
			</div>

			{activeTab === 'tutores' && (
				<div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
					<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
						<div>
							<h2 className="text-lg font-bold text-gray-900">Tutores ({filteredTutors.length})</h2>
							<p className="text-sm text-gray-500">Busca por nombre, correo, especialidad, curso, grupo u horario.</p>
						</div>
						<div className="relative w-full md:w-96">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
							<input
								type="text"
								value={tutorSearch}
								onChange={e => setTutorSearch(e.target.value)}
								placeholder="Buscar tutor por nombre, correo, especialidad, curso, grupo..."
								className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
							/>
						</div>
					</div>

					<div className="grid gap-3 md:grid-cols-2">
						{filteredTutors.length === 0 ? (
							<div className="col-span-2 text-center text-gray-500 py-12">
								No se encontró ningún tutor con esa búsqueda.
							</div>
						) : (
							filteredTutors.map(tutor => (
								<div key={tutor.id} className="border rounded p-4 bg-white shadow-sm">
									<div className="flex flex-col sm:flex-row sm:justify-between gap-3">
										<div>
											<div className="font-medium text-gray-900">{tutor.name}</div>
											<div className="text-xs text-gray-500">{tutor.email}</div>
											{tutor.phone && <div className="text-xs text-gray-500">Tel: {tutor.phone}</div>}
										</div>
									</div>

									<div className="mt-4">
										<div className="text-sm font-medium text-gray-700">Especialidades</div>
										<div className="mt-2 flex flex-wrap gap-2">
											{tutor.specialties?.length ? tutor.specialties.map((s: string) => (
												<span key={s} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100">{s}</span>
											)) : <span className="text-xs text-gray-400">Sin especialidades</span>}
										</div>
									</div>

									{tutor.courses?.length ? (
										<div className="mt-4">
											<div className="text-sm font-medium text-gray-700">Cursos</div>
											<div className="mt-2 flex flex-wrap gap-2">
												{tutor.courses.map((course: string) => (
													<span key={course} className="text-xs bg-slate-50 text-slate-700 px-2 py-0.5 rounded-full border border-slate-100">{course}</span>
												))}
											</div>
										</div>
									) : null}

									{(tutor.availability?.length || tutor.courseAvailability?.length) ? (
										<div className="mt-4">
											<div className="text-sm font-medium text-gray-700">Horarios</div>
											<div className="mt-2 grid gap-2">
												{tutor.availability?.map((avail: any, index: number) => (
													<div key={`avail-${index}`} className="text-sm bg-gray-50 border border-gray-100 rounded px-3 py-2">
														<div className="font-medium">{avail.days?.join(', ')}</div>
														<div className="text-xs text-gray-500">{avail.startTime} - {avail.endTime}</div>
													</div>
												))}
												{tutor.courseAvailability?.map((avail: any, index: number) => (
													<div key={`course-avail-${index}`} className="text-sm bg-gray-50 border border-gray-100 rounded px-3 py-2">
														<div className="font-medium">{avail.courses?.join(', ')}</div>
														<div className="text-xs text-gray-500">{avail.days?.join(', ')} · {avail.startTime} - {avail.endTime}</div>
													</div>
												))}
											</div>
										</div>
									) : null}

									<div className="mt-4">
										<div className="text-sm font-medium text-gray-700">Grupos</div>
										{tutor.groups?.length ? (
											<div className="mt-2 grid gap-2">
												{tutor.groups.map((g: any) => (
													<div key={g.id ?? `${tutor.id}-${g.name}`} className="text-sm bg-gray-50 border border-gray-100 rounded px-3 py-2">
														<div className="font-medium">{g.name ?? g.course ?? 'Grupo'}</div>
														<div className="text-xs text-gray-500">{g.course ?? '-'}</div>
														<div className="text-xs text-gray-500">{g.day ?? '-'} · {g.startTime ?? '-'} - {g.endTime ?? '-'}</div>
														<div className="text-xs text-gray-500">Sala: {g.room ?? '-'}</div>
													</div>
												))}
											</div>
										) : (
											<p className="text-xs text-gray-400 mt-1">Sin grupos</p>
										)}
									</div>
								</div>
							))
						)}
					</div>
				</div>
			)}
			{activeTab === 'solicitudes' && (
			<div className="grid gap-6">
				{/* Pending */}
				<div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
					<div className="p-4 border-b border-gray-100 flex items-center justify-between">
						<h3 className="font-bold text-gray-900">Pendientes ({pendingRequests.length})</h3>
					</div>
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
								{pendingRequests.length === 0 ? (
									<tr>
										<td colSpan={4} className="px-6 py-8 text-center text-gray-500">No hay solicitudes pendientes con los filtros actuales.</td>
									</tr>
								) : (
									pendingRequests.map(req => (
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
												</div>
											</td>
											<td className="px-6 py-4 text-right">
												<div className="flex justify-end gap-2">
													<button
														onClick={() => setAssigningId(assigningId === req.id ? null : req.id)}
														className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded transition-colors"
													>
														<UserCheck className="w-3 h-3" /> {req.tutorId ? 'Reasignar' : 'Asignar'}
													</button>
													<button
														onClick={() => { setEditingId(req.id); setEditStatus(req.status); }}
														className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
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

				{/* Active */}
				<div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
					<div className="p-4 border-b border-gray-100 flex items-center justify-between">
						<h3 className="font-bold text-gray-900">Activas ({activeRequests.length})</h3>
					</div>
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
								{activeRequests.length === 0 ? (
									<tr>
										<td colSpan={4} className="px-6 py-8 text-center text-gray-500">No hay solicitudes activas con los filtros actuales.</td>
									</tr>
								) : (
									activeRequests.map(req => (
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
												</div>
											</td>
											<td className="px-6 py-4 text-right">
												<div className="flex justify-end gap-2">
													<button
														onClick={() => setAssigningId(assigningId === req.id ? null : req.id)}
														className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded transition-colors"
													>
														<UserCheck className="w-3 h-3" /> {req.tutorId ? 'Reasignar' : 'Asignar'}
													</button>
													<button
														onClick={() => { setEditingId(req.id); setEditStatus(req.status); }}
														className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
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

				{/* Failed / Rejected */}
				<div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
					<div className="p-4 border-b border-gray-100 flex items-center justify-between">
						<h3 className="font-bold text-gray-900">Requieren Atención ({failedRequests.length})</h3>
					</div>
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
								{failedRequests.length === 0 ? (
									<tr>
										<td colSpan={4} className="px-6 py-8 text-center text-gray-500">No hay solicitudes que requieran atención con los filtros actuales.</td>
									</tr>
								) : (
									failedRequests.map(req => (
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
													{req.rejectionReason && <span className="text-[10px] text-red-600 mt-1 max-w-[150px] truncate">Motivo: {req.rejectionReason}</span>}
												</div>
											</td>
											<td className="px-6 py-4 text-right">
												<div className="flex justify-end gap-2">
													<button
														onClick={() => setAssigningId(assigningId === req.id ? null : req.id)}
														className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded transition-colors"
													>
														<UserCheck className="w-3 h-3" /> {req.tutorId ? 'Reasignar' : 'Asignar'}
													</button>
													<button
														onClick={() => { setEditingId(req.id); setEditStatus(req.status); }}
														className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
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
			</div>
			)}

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
										<div className="flex-1">
											<h4 className="font-bold text-gray-900">{tutor.name}</h4>
											<div className="flex gap-2 mt-2 flex-wrap">
												{tutor.specialties?.length ? tutor.specialties.map(s => (
													<span key={s} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100">{s}</span>
												)) : <span className="text-xs text-gray-400">Sin especialidades</span>}
											</div>
											<div className="mt-3">
												<h5 className="text-sm font-medium text-gray-700">Grupos:</h5>
												{tutor.groups?.length ? (
													<div className="flex flex-col gap-2 mt-2">
														{tutor.groups.map((g: any) => (
															<div key={g.id ?? `${tutor.id}-${g.name}`} className="text-sm bg-gray-50 border border-gray-100 rounded px-3 py-2">
																<div className="font-medium">{g.name ?? g.course ?? 'Grupo'}</div>
																<div className="text-xs text-gray-500">Asignatura: {g.course ?? '-'} · Día: {g.day ?? '-'}</div>
															</div>
														))}
													</div>
												) : (
													<p className="text-xs text-gray-400 mt-2">Sin grupos creados</p>
												)}
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
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Contraseña temporal</label>
								<input required type="password" value={newTutorPassword} onChange={e => setNewTutorPassword(e.target.value)} placeholder="Mínimo 6 caracteres" className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none" />
							</div>
							{tutorError && <p className="text-red-500 text-sm">{tutorError}</p>}
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

