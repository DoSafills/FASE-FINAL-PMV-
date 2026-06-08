import pool from '../config/db.js';

// GET 
export const getTutores = async (req, res) => {
  try {
    const [tutores] = await pool.query('SELECT * FROM tutores ORDER BY nombre');

    for (const tutor of tutores) {
      const [especializaciones] = await pool.query(
        'SELECT id, nombre FROM especializaciones WHERE tutor_id = ?',
        [tutor.id]
      );
      const [horarios] = await pool.query(
        'SELECT id, dia, hora_inicio, hora_fin FROM horarios WHERE tutor_id = ?',
        [tutor.id]
      );
      const [cursos] = await pool.query(
        'SELECT id, curso FROM tutor_cursos WHERE tutor_id = ?', [tutor.id]   
      );
      const [horariosCurso] = await pool.query(
        'SELECT id, cursos, dias, hora_inicio, hora_fin FROM tutor_horarios_curso WHERE tutor_id = ?', [tutor.id]  
      );
      tutor.cursos          = cursos;
      tutor.horarios_curso  = horariosCurso;
      tutor.especializaciones = especializaciones;
      tutor.horarios = horarios;
    }

    res.json(tutores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET 
export const getTutorById = async (req, res) => {
  try {
    const { id } = req.params;
    const [[tutor]] = await pool.query('SELECT * FROM tutores WHERE id = ?', [id]);

    if (!tutor) return res.status(404).json({ error: 'Tutor no encontrado' });

    const [especializaciones] = await pool.query(
      'SELECT id, nombre FROM especializaciones WHERE tutor_id = ?',
      [id]
    );
    const [horarios] = await pool.query(
      'SELECT id, dia, hora_inicio, hora_fin FROM horarios WHERE tutor_id = ?',
      [id]
    );
    const [cursos] = await pool.query(
      'SELECT id, curso FROM tutor_cursos WHERE tutor_id = ?', [id]
    );
    const [horariosCurso] = await pool.query(
      'SELECT id, cursos, dias, hora_inicio, hora_fin FROM tutor_horarios_curso WHERE tutor_id = ?', [id]
    );
    tutor.cursos          = cursos;
    tutor.horarios_curso  = horariosCurso;
    tutor.especializaciones = especializaciones;
    tutor.horarios = horarios;

    res.json(tutor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST 
export const createTutor = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { nombre, email, telefono, titulo, anos_experiencia, disponibilidad, especializaciones = [], horarios = [] } = req.body;

    if (!nombre || !email) {
      return res.status(422).json({ error: 'nombre y email son requeridos' });
    }

    await conn.beginTransaction();

    const [result] = await conn.query(
      'INSERT INTO tutores (nombre, email, telefono, titulo, anos_experiencia, disponibilidad) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre, email, telefono ?? null, titulo ?? null, anos_experiencia ?? null, disponibilidad ?? 'Media']
    );
    const tutorId = result.insertId;

    for (const nombre_esp of especializaciones) {
      await conn.query(
        'INSERT INTO especializaciones (tutor_id, nombre) VALUES (?, ?)',
        [tutorId, nombre_esp]
      );
    }

    for (const h of horarios) {
      await conn.query(
        'INSERT INTO horarios (tutor_id, dia, hora_inicio, hora_fin) VALUES (?, ?, ?, ?)',
        [tutorId, h.dia, h.hora_inicio, h.hora_fin]
      );
    }

    await conn.commit();
    res.status(201).json({ id: tutorId, mensaje: 'Tutor registrado correctamente' });
  } catch (err) {
    await conn.rollback();
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Ya existe un tutor con ese email' });
    }
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
};

// PUT 
export const updateTutor = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { id } = req.params;
    const { nombre, email, telefono, titulo, anos_experiencia, disponibilidad, especializaciones, horarios } = req.body;

    await conn.beginTransaction();

    await conn.query(
      `UPDATE tutores SET
        nombre           = COALESCE(?, nombre),
        email            = COALESCE(?, email),
        telefono         = COALESCE(?, telefono),
        titulo           = COALESCE(?, titulo),
        anos_experiencia = COALESCE(?, anos_experiencia),
        disponibilidad   = COALESCE(?, disponibilidad)
       WHERE id = ?`,
      [nombre, email, telefono, titulo, anos_experiencia, disponibilidad, id]
    );

    if (especializaciones) {
      await conn.query('DELETE FROM especializaciones WHERE tutor_id = ?', [id]);
      for (const nombre_esp of especializaciones) {
        await conn.query(
          'INSERT INTO especializaciones (tutor_id, nombre) VALUES (?, ?)',
          [id, nombre_esp]
        );
      }
    }

    if (horarios) {
      await conn.query('DELETE FROM horarios WHERE tutor_id = ?', [id]);
      for (const h of horarios) {
        await conn.query(
          'INSERT INTO horarios (tutor_id, dia, hora_inicio, hora_fin) VALUES (?, ?, ?, ?)',
          [id, h.dia, h.hora_inicio, h.hora_fin]
        );
      }
    }

    await conn.commit();
    res.json({ mensaje: 'Tutor actualizado correctamente' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
};

// PUT 
export const updateCursos = async (req, res) => {
  try {
    const { id }    = req.params;
    const { cursos } = req.body; // string[]

    await pool.query('DELETE FROM tutor_cursos WHERE tutor_id = ?', [id]);
    for (const curso of (cursos ?? [])) {
      await pool.query(
        'INSERT INTO tutor_cursos (tutor_id, curso) VALUES (?, ?)',
        [id, curso]
      );
    }
    res.json({ mensaje: 'Cursos actualizados correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT 
export const updateHorariosCurso = async (req, res) => {
  try {
    const { id }            = req.params;
    const { horarios_curso } = req.body; // CourseAvailability[]

    await pool.query('DELETE FROM tutor_horarios_curso WHERE tutor_id = ?', [id]);
    for (const h of (horarios_curso ?? [])) {
      await pool.query(
        'INSERT INTO tutor_horarios_curso (tutor_id, cursos, dias, hora_inicio, hora_fin) VALUES (?, ?, ?, ?, ?)',
        [id, JSON.stringify(h.courses), JSON.stringify(h.days), h.startTime, h.endTime]
      );
    }
    res.json({ mensaje: 'Horarios por curso actualizados correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE 
export const deleteTutor = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM tutores WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Tutor no encontrado' });
    res.json({ mensaje: 'Tutor eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};