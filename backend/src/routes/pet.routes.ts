import { Router } from 'express';
import { createPet, getPets, getPetById, updatePet, deletePet, addWeightLog, addVaccination } from '../controllers/pet.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect); // All pet endpoints require authentication

router.route('/')
  .post(createPet)
  .get(getPets);

router.route('/:id')
  .get(getPetById)
  .put(updatePet)
  .delete(deletePet);

router.post('/:id/weight', addWeightLog);
router.post('/:id/vaccination', addVaccination);

export default router;
