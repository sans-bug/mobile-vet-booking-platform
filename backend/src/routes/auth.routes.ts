import { Router } from 'express';
import { register, login, googleLogin, forgotPassword, getMe, updateProfile } from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google-login', googleLogin);
router.post('/forgot-password', forgotPassword);

router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);

export default router;
