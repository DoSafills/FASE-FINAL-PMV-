import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const SALT_ROUNDS = 10;

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { nombre, email, password, rol, semestre } = req.body;

    if (!nombre || !email || !password || !rol) {
      return res.status(422).json({ error: 'nombre, email, password y rol son requeridos' });
    }

    if (rol !== 'ESTUDIANTE') {
    return res.status(422).json({ error: 'El registro público es solo para estudiantes' });
    }

    if (password.length < 6) {
      return res.status(422).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Verificar email único
    const [[existe]] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existe) {
      return res.status(409).json({ error: 'Ya existe una cuenta con ese email' });
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // 1. Crear en usuarios (login)
      const [result] = await conn.query(
        'INSERT INTO usuarios (nombre, email, password, rol, semestre) VALUES (?, ?, ?, ?, ?)',
        [nombre, email, hash, rol, rol === 'ESTUDIANTE' ? (semestre ?? null) : null]
      );
      const usuarioId = result.insertId;

      // 2. Si es TUTOR, crear también su perfil en la tabla tutores
      let tutorId = null;
      if (rol === 'TUTOR') {
        const [resultTutor] = await conn.query(
          'INSERT INTO tutores (nombre, email, disponibilidad) VALUES (?, ?, ?)',
          [nombre, email, 'Media']
        );
        tutorId = resultTutor.insertId;
      }

      await conn.commit();

      // Generar token
      const token = jwt.sign(
        { id: usuarioId, email, rol, tutorId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.status(201).json({
        token,
        user: { id: usuarioId, nombre, email, rol, semestre: semestre ?? null, tutorId },
      });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(422).json({ error: 'email y password son requeridos' });
    }

    const [[usuario]] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const passwordOk = await bcrypt.compare(password, usuario.password);
    if (!passwordOk) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Si es tutor, buscar su tutorId en la tabla tutores
    let tutorId = null;
    if (usuario.rol === 'TUTOR') {
      const [[tutor]] = await pool.query('SELECT id FROM tutores WHERE email = ?', [usuario.email]);
      tutorId = tutor?.id ?? null;
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol, tutorId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      token,
      user: {
        id:       usuario.id,
        nombre:   usuario.nombre,
        email:    usuario.email,
        rol:      usuario.rol,
        semestre: usuario.semestre,
        tutorId,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/auth/me  (requiere token)
export const me = async (req, res) => {
  try {
    const [[usuario]] = await pool.query(
      'SELECT id, nombre, email, rol, semestre FROM usuarios WHERE id = ?',
      [req.user.id]
    );
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    res.json({ ...usuario, tutorId: req.user.tutorId ?? null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/auth/crear-tutor  (solo accesible para ENCARGADO)
export const crearTutor = async (req, res) => {
  try {
    const { nombre, email, password, telefono } = req.body;

    if (!nombre || !email || !password) {
      return res.status(422).json({ error: 'nombre, email y password son requeridos' });
    }
    if (password.length < 6) {
      return res.status(422).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const [[existe]] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existe) {
      return res.status(409).json({ error: 'Ya existe una cuenta con ese email' });
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      await conn.query(
        'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
        [nombre, email, hash, 'TUTOR']
      );

      const [resultTutor] = await conn.query(
        'INSERT INTO tutores (nombre, email, telefono, disponibilidad) VALUES (?, ?, ?, ?)',
        [nombre, email, telefono ?? null, 'Media']
      );

      await conn.commit();
      res.status(201).json({ id: resultTutor.insertId, mensaje: 'Tutor creado correctamente' });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};