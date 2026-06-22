import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './src/config/db.js';
import tutoresRouter from './src/routes/tutores.js';
import solicitudesRouter from './src/routes/solicitudes.js';
import notificacionesRouter from './src/routes/notificaciones.js';
import dashboardRouter   from './src/routes/dashboard.js';  
import gruposRouter from './src/routes/grupos.js';
import authRouter from './src/routes/auth.js';

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use('/api/tutores', tutoresRouter);
app.use('/api/solicitudes', solicitudesRouter);
app.use('/api/notificaciones', notificacionesRouter);
app.use('/api/dashboard',      dashboardRouter);
app.use('/api/grupos', gruposRouter);
app.use('/api/auth', authRouter);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});