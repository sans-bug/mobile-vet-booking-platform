import { Router } from 'express';
import { getAdminAnalytics, getVetAnalytics } from '../controllers/analytics.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.get('/admin', restrictTo('admin'), getAdminAnalytics);
router.get('/vet', restrictTo('veterinarian'), getVetAnalytics);

export default router;
