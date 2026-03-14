import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { chat, listConversations, getOneConversation, removeConversation } from '../controllers/ai.controller';

const router = Router();

router.post('/chat', authenticate, chat);
router.get('/conversations', authenticate, listConversations);
router.get('/conversations/:id', authenticate, getOneConversation);
router.delete('/conversations/:id', authenticate, removeConversation);

export default router;
