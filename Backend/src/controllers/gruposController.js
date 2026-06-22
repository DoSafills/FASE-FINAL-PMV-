import pool from '../config/db.js';

// GET /api/grupos?tutor_id=1
export const getGrupos = async (req, res) => {
  try {
    const { tutor_id } = req.query;
    let sql = 'SELECT * FROM grupos';
    const params = [];

    if (tutor_id) {
      sql += ' WHERE tutor_id = ?';
      params.push(tutor_id);
    }
    sql += ' ORDER BY fecha_creacion DESC';

    const [grupos] = await pool.query(sql, params);

    for (const g of grupos) {
      const [estudiantes] = await pool.query(
        'SELECT solicitud_id, student_id FROM grupo_estudiantes WHERE grupo_id = ?',
        [g.id]
      );
      g.studentIds = estudiantes.map(e => e.student_id);
    }

    res.json(grupos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/grupos
export const createGrupo = async (req, res) => {
  try {
    const { tutor_id, nombre, curso, dia, hora_inicio, hora_fin, sala, cupo_maximo } = req.body;

    if (!tutor_id || !nombre || !curso || !dia || !hora_inicio || !hora_fin || !sala) {
      return res.status(422).json({ error: 'Faltan campos requeridos para crear el grupo' });
    }

    const [result] = await pool.query(
      `INSERT INTO grupos (tutor_id, nombre, curso, dia, hora_inicio, hora_fin, sala, cupo_maximo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [tutor_id, nombre, curso, dia, hora_inicio, hora_fin, sala, cupo_maximo ?? 5]
    );

    res.status(201).json({ id: result.insertId, mensaje: 'Grupo creado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/grupos/:id
export const deleteGrupo = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM grupos WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Grupo no encontrado' });
    res.json({ mensaje: 'Grupo eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/grupos/:id/estudiantes  → agregar uno o varios estudiantes
export const addEstudiantesToGrupo = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentIds } = req.body; // string[] de student_id

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(422).json({ error: 'studentIds debe ser un array con al menos un elemento' });
    }

    for (const studentId of studentIds) {
      // Buscar la solicitud más reciente de ese estudiante
      const [[solicitud]] = await pool.query(
        'SELECT id FROM solicitudes WHERE student_id = ? ORDER BY fecha_solicitud DESC LIMIT 1',
        [studentId]
      );
      if (!solicitud) continue;

      await pool.query(
        `INSERT IGNORE INTO grupo_estudiantes (grupo_id, solicitud_id, student_id)
         VALUES (?, ?, ?)`,
        [id, solicitud.id, studentId]
      );
    }

    res.json({ mensaje: 'Estudiantes agregados al grupo' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/grupos/:id/estudiantes/:studentId
export const removeEstudianteFromGrupo = async (req, res) => {
  try {
    const { id, studentId } = req.params;
    await pool.query(
      'DELETE FROM grupo_estudiantes WHERE grupo_id = ? AND student_id = ?',
      [id, studentId]
    );
    res.json({ mensaje: 'Estudiante removido del grupo' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};