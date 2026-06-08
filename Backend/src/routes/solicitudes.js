import { Router } from 'express';
import {
  getSolicitudes,
  getSolicitudById,
  createSolicitud,
  updateEstado,
  asignarTutor,
  registrarAsistencia,
  deleteSolicitud,
} from '../controllers/solicitudesController.js';

const router = Router();

router.get('/',                      getSolicitudes);
router.get('/:id',                   getSolicitudById);
router.post('/',                     createSolicitud);
router.put('/:id/estado',            updateEstado);
router.put('/:id/asignar',           asignarTutor);
router.put('/:id/asistencia',        registrarAsistencia);
router.delete('/:id',                deleteSolicitud);

export default router;