import express from 'express';
import { getAIInsights, chatWithAI } from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/insights', getAIInsights);
router.post('/chat', chatWithAI);

export default router;
