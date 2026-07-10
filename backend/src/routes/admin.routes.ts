import { Router } from 'express';
import { getUsers, deleteUser, getVets, verifyVet } from '../controllers/admin.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);
router.use(restrictTo('admin'));

router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);

router.get('/vets', getVets);
router.put('/vets/:id/verify', verifyVet);

export default router;
