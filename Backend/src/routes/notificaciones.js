import { Router } from 'express';
import {
  getNotificaciones,
  marcarLeida,
  marcarTodasLeidas,
  deleteNotificacion,
} from '../controllers/notificacionesController.js';

const router = Router();

router.get('/',                   getNotificaciones);
router.put('/leer-todas',         marcarTodasLeidas);  
router.put('/:id/leer',           marcarLeida);
router.delete('/:id',             deleteNotificacion);

export default router;