import { Router } from 'express';
import {
  getGrupos,
  createGrupo,
  deleteGrupo,
  addEstudiantesToGrupo,
  removeEstudianteFromGrupo,
} from '../controllers/gruposController.js';

const router = Router();

router.get('/',                          getGrupos);
router.post('/',                         createGrupo);
router.delete('/:id',                    deleteGrupo);
router.post('/:id/estudiantes',          addEstudiantesToGrupo);
router.delete('/:id/estudiantes/:studentId', removeEstudianteFromGrupo);

export default router;