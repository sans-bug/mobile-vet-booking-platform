import { Router } from 'express';
import { createReview, getVetReviews } from '../controllers/review.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.get('/vet/:vetId', getVetReviews);

router.use(protect);
router.post('/', createReview);

export default router;
