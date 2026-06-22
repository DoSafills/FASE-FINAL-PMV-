import { Router } from 'express';
import { register, login, me, crearTutor } from '../controllers/authController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.post('/register',    register);
router.post('/login',       login);
router.get('/me',           requireAuth, me);
router.post('/crear-tutor', requireAuth, requireRole('ENCARGADO'), crearTutor);

export default router;