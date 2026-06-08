import pool from '../config/db.js';

const timeToMinutes = (time) => {
  const [h, m] = (time ?? '00:00').split(':').map(Number);
  return h * 60 + m;
};

// GET 
export const getSolicitudes = async (req, res) => {
  try {
    const { estado, nombre_estudiante, ramo } = req.query;

    let sql = `
      SELECT s.*, t.nombre AS tutor_nombre
      FROM solicitudes s
      LEFT JOIN tutores t ON t.id = s.tutor_id
      WHERE 1=1
    `;
    const params = [];

    if (estado)             { sql += ' AND s.estado = ?';                    params.push(estado); }
    if (nombre_estudiante)  { sql += ' AND s.nombre_estudiante LIKE ?';      params.push(`%${nombre_estudiante}%`); }
    if (ramo)               { sql += ' AND s.ramo LIKE ?';                   params.push(`%${ramo}%`); }

    sql += ` ORDER BY FIELD(s.prioridad,'Alta','Media','Baja'), s.fecha_solicitud ASC`;

    const [solicitudes] = await pool.query(sql, params);
    res.json(solicitudes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET 
export const getSolicitudById = async (req, res) => {
  try {
    const { id } = req.params;
    const [[solicitud]] = await pool.query(
      `SELECT s.*, t.nombre AS tutor_nombre, t.email AS tutor_email
       FROM solicitudes s
       LEFT JOIN tutores t ON t.id = s.tutor_id
       WHERE s.id = ?`,
      [id]
    );
    if (!solicitud) return res.status(404).json({ error: 'Solicitud no encontrada' });
    res.json(solicitud);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST 
export const createSolicitud = async (req, res) => {
  try {
    const {
      nombre_estudiante,
      semestre,
      carrera         = '',
      ramo,
      tema,
      prioridad,
      modalidad              = 'ONLINE',
      dias_preferidos        = null,
      hora_inicio_preferida  = null,
      hora_fin_preferida     = null,
      student_id             = null,
      fecha_tutoria          = null,
    } = req.body;

    if (!nombre_estudiante || !semestre || !ramo || !tema || !prioridad) {
      return res.status(422).json({
        error: 'Faltan campos requeridos: nombre_estudiante, semestre, ramo, tema, prioridad'
      });
    }

    let tutorId = null;

    const [candidatos] = await pool.query(
      `SELECT DISTINCT tutor_id FROM tutor_cursos WHERE curso = ?`,
      [ramo]
    );

    if (candidatos.length > 0 && dias_preferidos && hora_inicio_preferida) {
      const diasPref  = JSON.parse(dias_preferidos);
      const inicioMin = timeToMinutes(hora_inicio_preferida);
      const finMin    = timeToMinutes(hora_fin_preferida ?? '23:59');

      for (const c of candidatos) {
        const [horarios] = await pool.query(
          `SELECT cursos, dias, hora_inicio, hora_fin
           FROM tutor_horarios_curso WHERE tutor_id = ?`,
          [c.tutor_id]
        );

        for (const h of horarios) {
          const dias           = JSON.parse(h.dias  ?? '[]');
          const cursos         = JSON.parse(h.cursos ?? '[]');
          const coincideDia    = dias.some((d) => diasPref.includes(d));
          const coincideCurso  = cursos.includes(ramo);
          const overlapInicio  = Math.max(inicioMin, timeToMinutes(h.hora_inicio));
          const overlapFin     = Math.min(finMin,    timeToMinutes(h.hora_fin));

          if (coincideDia && coincideCurso && (overlapFin - overlapInicio) >= 60) {
            tutorId = c.tutor_id;
            break;
          }
        }
        if (tutorId) break;
      }
    }

    if (!tutorId && candidatos.length > 0) {
      tutorId = candidatos[0].tutor_id;
    }

    const estado = tutorId ? 'Tutor asignado' : 'Buscando tutor';

    // ── Insertar solicitud ────────────────────────────────────
    const [result] = await pool.query(
      `INSERT INTO solicitudes
        (nombre_estudiante, semestre, carrera, ramo, tema, prioridad,
         estado, tutor_id, modalidad, dias_preferidos,
         hora_inicio_preferida, hora_fin_preferida, student_id, fecha_tutoria)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre_estudiante, semestre, carrera, ramo, tema, prioridad,
        estado, tutorId, modalidad, dias_preferidos,
        hora_inicio_preferida, hora_fin_preferida, student_id, fecha_tutoria,
      ]
    );
    const nuevaId = result.insertId;

    // ── Notificación automática ───────────────────────────────
    await pool.query(
      `INSERT INTO notificaciones (tutor_id, titulo, mensaje, tipo)
       VALUES (?, 'Nueva solicitud de tutoría', ?, 'nueva_tutoria')`,
      [tutorId, `${nombre_estudiante} necesita tutoría de ${ramo}`]
    );

    res.status(201).json({
      id:             nuevaId,
      estado,
      tutor_asignado: tutorId !== null,
      mensaje: tutorId
        ? 'Solicitud creada y tutor asignado automáticamente'
        : 'Solicitud creada — sin tutor disponible, requiere asignación manual',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT 
export const updateEstado = async (req, res) => {
  try {
    const { id }    = req.params;
    const { estado, motivo } = req.body;

    const estadosValidos = [
      'Pendiente', 'Buscando tutor', 'Tutor asignado',
      'Programada', 'Finalizada', 'Reasignación', 'Rechazada', 'Cancelada',
    ];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ error: `Estado no válido. Opciones: ${estadosValidos.join(', ')}` });
    }

    const [result] = await pool.query(
      `UPDATE solicitudes
       SET estado              = ?,
           motivo_rechazo      = IF(? = 'Rechazada',   ?, motivo_rechazo),
           motivo_cancelacion  = IF(? = 'Cancelada',   ?, motivo_cancelacion),
           motivo_continuidad  = IF(? = 'Reasignación',?, motivo_continuidad)
       WHERE id = ?`,
      [estado, estado, motivo ?? null, estado, motivo ?? null, estado, motivo ?? null, id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Solicitud no encontrada' });

    if (estado === 'Rechazada') {
      const [[sol]] = await pool.query(
        'SELECT ramo, nombre_estudiante FROM solicitudes WHERE id = ?', [id]
      );
      await pool.query(
        `INSERT INTO notificaciones (titulo, mensaje, tipo)
         VALUES ('Tutoría rechazada', ?, 'mensaje_admin')`,
        [`La solicitud de ${sol.ramo} (${sol.nombre_estudiante}) fue rechazada.`]
      );
    }

    res.json({ mensaje: 'Estado actualizado', estado });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT 
export const asignarTutor = async (req, res) => {
  try {
    const { id }      = req.params;
    const { tutor_id } = req.body;

    if (!tutor_id) return res.status(422).json({ error: 'tutor_id es requerido' });

    const [[tutor]] = await pool.query('SELECT id, nombre FROM tutores WHERE id = ?', [tutor_id]);
    if (!tutor) return res.status(404).json({ error: 'Tutor no encontrado' });

    await pool.query(
      "UPDATE solicitudes SET tutor_id = ?, estado = 'Tutor asignado' WHERE id = ?",
      [tutor_id, id]
    );

    const [[sol]] = await pool.query(
      'SELECT ramo, nombre_estudiante FROM solicitudes WHERE id = ?', [id]
    );
    await pool.query(
      `INSERT INTO notificaciones (tutor_id, titulo, mensaje, tipo)
       VALUES (?, 'Nueva tutoría asignada', ?, 'nueva_tutoria')`,
      [tutor_id, `Se te asignó la tutoría de ${sol.ramo} para ${sol.nombre_estudiante}`]
    );

    res.json({ mensaje: `Tutor ${tutor.nombre} asignado correctamente` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT 
export const registrarAsistencia = async (req, res) => {
  try {
    const { id }     = req.params;
    const { asistio } = req.body;

    if (asistio === undefined) {
      return res.status(422).json({ error: 'El campo asistio es requerido (true/false)' });
    }

    await pool.query(
      `UPDATE solicitudes
       SET estado        = 'Finalizada',
           asistio       = ?,
           fecha_tutoria = COALESCE(fecha_tutoria, NOW())
       WHERE id = ?`,
      [asistio ? 1 : 0, id]
    );

    res.json({ mensaje: 'Asistencia registrada', asistio: Boolean(asistio) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE 
export const deleteSolicitud = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM solicitudes WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Solicitud no encontrada' });
    res.json({ mensaje: 'Solicitud eliminada correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};