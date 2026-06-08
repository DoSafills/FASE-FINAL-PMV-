import pool from '../config/db.js';


export const getNotificaciones = async (req, res) => {
  try {
    const { tutor_id, leida } = req.query;

    let sql = 'SELECT * FROM notificaciones WHERE 1=1';
    const params = [];

    if (tutor_id) {
      sql += ' AND (tutor_id = ? OR tutor_id IS NULL)';
      params.push(Number(tutor_id));
    }
    if (leida !== undefined) {
      sql += ' AND leida = ?';
      params.push(leida === 'true' || leida === '1' ? 1 : 0);
    }

    sql += ' ORDER BY fecha DESC';

    const [notificaciones] = await pool.query(sql, params);
    res.json(notificaciones);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT 
export const marcarLeida = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(
      'UPDATE notificaciones SET leida = 1 WHERE id = ?',
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Notificación no encontrada' });
    }
    res.json({ mensaje: 'Notificación marcada como leída' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT 
export const marcarTodasLeidas = async (req, res) => {
  try {
    const { tutor_id } = req.body;

    if (tutor_id) {
      await pool.query(
        'UPDATE notificaciones SET leida = 1 WHERE leida = 0 AND (tutor_id = ? OR tutor_id IS NULL)',
        [Number(tutor_id)]
      );
    } else {
      await pool.query('UPDATE notificaciones SET leida = 1 WHERE leida = 0');
    }

    res.json({ mensaje: 'Todas las notificaciones marcadas como leídas' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE 
export const deleteNotificacion = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(
      'DELETE FROM notificaciones WHERE id = ?',
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Notificación no encontrada' });
    }
    res.json({ mensaje: 'Notificación eliminada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};  