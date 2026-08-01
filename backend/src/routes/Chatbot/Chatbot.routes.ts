import { Router } from 'express';
import { 
  startConversation, 
  sendMessage, 
  getHistory, 
  getConversations,
  deleteConversation // Nhúng thêm hàm xóa
} from '../../controllers/Chatbot/Chatbot.controller.js';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import { optionalAuthMiddleware } from '../../middleware/authMiddleware.js';

const router = Router();

router.use(optionalAuthMiddleware);

router.post('/start', asyncHandler(startConversation));
router.post('/send', asyncHandler(sendMessage));

router.get('/conversations', asyncHandler(getConversations));
router.get('/:conversationId/history', asyncHandler(getHistory));

// THÊM MỚI: Route để xóa
router.delete('/:conversationId', asyncHandler(deleteConversation));

export default router;