import { Router } from 'express';
import { getMessages, sendMessage, getChatContacts, handleAIChatbot } from '../controllers/chat.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// AI Bot does not strictly require auth, but can use it
router.post('/bot', handleAIChatbot);

router.use(protect);

router.get('/contacts', getChatContacts);
router.get('/messages/:userId', getMessages);
router.post('/messages', sendMessage);

export default router;
