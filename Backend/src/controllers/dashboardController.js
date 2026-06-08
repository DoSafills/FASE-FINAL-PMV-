import pool from '../config/db.js';

export const getDashboard = async (req, res) => {
  try {
    const { tutor_id } = req.query;

    if (!tutor_id) {
      const [[stats]] = await pool.query(`
        SELECT
          COUNT(*)                            AS total,
          SUM(estado = 'Pendiente')           AS pendientes,
          SUM(estado = 'Buscando tutor')      AS buscando_tutor,
          SUM(estado = 'Tutor asignado')      AS tutor_asignado,
          SUM(estado = 'Programada')          AS programadas,
          SUM(estado = 'Finalizada')          AS finalizadas,
          SUM(estado = 'Rechazada')           AS rechazadas,
          SUM(estado = 'Cancelada')           AS canceladas,
          SUM(estado = 'Reasignación')        AS reasignacion
        FROM solicitudes
      `);

      const [[{ total_tutores }]] = await pool.query(
        'SELECT COUNT(*) AS total_tutores FROM tutores'
      );

      const [alertas] = await pool.query(`
        SELECT id, nombre_estudiante, ramo, prioridad, fecha_solicitud
        FROM solicitudes
        WHERE estado IN ('Buscando tutor', 'Rechazada', 'Reasignación')
        ORDER BY FIELD(prioridad, 'Alta', 'Media', 'Baja'), fecha_solicitud ASC
        LIMIT 5
      `);

      const [porPrioridad] = await pool.query(`
        SELECT prioridad, COUNT(*) AS total
        FROM solicitudes
        GROUP BY prioridad
      `);

      return res.json({
        solicitudes:   stats,
        total_tutores,
        alertas,
        por_prioridad: porPrioridad,
      });
    }

    const [[tutor]] = await pool.query(
      'SELECT id, nombre, email, disponibilidad FROM tutores WHERE id = ?',
      [Number(tutor_id)]
    );
    if (!tutor) return res.status(404).json({ error: 'Tutor no encontrado' });

    const [[stats]] = await pool.query(`
      SELECT
        COUNT(*)                            AS total,
        SUM(estado = 'Tutor asignado')      AS asignadas,
        SUM(estado = 'Programada')          AS programadas,
        SUM(estado = 'Finalizada')          AS finalizadas,
        SUM(estado = 'Rechazada')           AS rechazadas,
        SUM(estado = 'Cancelada')           AS canceladas
      FROM solicitudes
      WHERE tutor_id = ?
    `, [Number(tutor_id)]);

    const [[{ no_leidas }]] = await pool.query(`
      SELECT COUNT(*) AS no_leidas
      FROM notificaciones
      WHERE leida = 0 AND (tutor_id = ? OR tutor_id IS NULL)
    `, [Number(tutor_id)]);

    const [proximas] = await pool.query(`
      SELECT id, nombre_estudiante, ramo, tema, fecha_tutoria, prioridad
      FROM solicitudes
      WHERE tutor_id = ? AND estado = 'Programada' AND fecha_tutoria >= NOW()
      ORDER BY fecha_tutoria ASC
      LIMIT 5
    `, [Number(tutor_id)]);

    res.json({
      tutor,
      solicitudes:          stats,
      notificaciones_nuevas: no_leidas,
      proximas_tutorias:    proximas,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};