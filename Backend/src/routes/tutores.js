import { Router } from 'express';
import { getTutores, getTutorById, createTutor, updateTutor, deleteTutor, updateCursos, updateHorariosCurso } from '../controllers/tutoresController.js';

const router = Router();

router.get('/',     getTutores);
router.get('/:id',  getTutorById);
router.post('/',    createTutor);
router.put('/:id',  updateTutor);
router.delete('/:id', deleteTutor);
router.put('/:id/cursos',         updateCursos);
router.put('/:id/horarios-curso', updateHorariosCurso);

export default router;