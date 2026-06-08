const BASE_URL = 'http://localhost:3001/api';


async function request(endpoint, options = {}) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Error en la petición');
  }

  return data;
}


export const tutoresApi = {
  getAll: () =>
    request('/tutores'),

  getById: (id) =>
    request(`/tutores/${id}`),

  create: (tutor) =>
    request('/tutores', {
      method: 'POST',
      body: JSON.stringify(tutor),
    }),

  update: (id, tutor) =>
    request(`/tutores/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tutor),
    }),

  delete: (id) =>
    request(`/tutores/${id}`, { method: 'DELETE' }),
};


export const solicitudesApi = {
  getAll: (filtros = {}) => {
    const params = new URLSearchParams(filtros).toString();
    return request(`/solicitudes${params ? '?' + params : ''}`);
  },

  getById: (id) =>
    request(`/solicitudes/${id}`),

  create: (solicitud) =>
    request('/solicitudes', {
      method: 'POST',
      body: JSON.stringify(solicitud),
    }),

  updateEstado: (id, estado) =>
    request(`/solicitudes/${id}/estado`, {
      method: 'PUT',
      body: JSON.stringify({ estado }),
    }),

  asignarTutor: (id, tutor_id) =>
    request(`/solicitudes/${id}/asignar`, {
      method: 'PUT',
      body: JSON.stringify({ tutor_id }),
    }),

  registrarAsistencia: (id, asistio) =>
    request(`/solicitudes/${id}/asistencia`, {
      method: 'PUT',
      body: JSON.stringify({ asistio }),
    }),

  delete: (id) =>
    request(`/solicitudes/${id}`, { method: 'DELETE' }),
};

export const notificacionesApi = {
  getAll: (filtros = {}) => {
    const params = new URLSearchParams(filtros).toString();
    return request(`/notificaciones${params ? '?' + params : ''}`);
  },

  marcarLeida: (id) =>
    request(`/notificaciones/${id}/leer`, { method: 'PUT' }),

  marcarTodasLeidas: (tutor_id) =>
    request('/notificaciones/leer-todas', {
      method: 'PUT',
      body: JSON.stringify(tutor_id ? { tutor_id } : {}),
    }),

  delete: (id) =>
    request(`/notificaciones/${id}`, { method: 'DELETE' }),
};

export const dashboardApi = {
  getEncargado: () =>
    request('/dashboard'),

  getTutor: (tutor_id) =>
    request(`/dashboard?tutor_id=${tutor_id}`),
};