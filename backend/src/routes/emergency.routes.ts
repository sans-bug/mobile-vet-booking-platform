import { Router } from 'express';
import { triggerSOS, getSOSRequests, respondToSOS } from '../controllers/emergency.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.post('/sos', triggerSOS);
router.get('/requests', getSOSRequests);
router.put('/requests/:id/respond', respondToSOS);

export default router;
