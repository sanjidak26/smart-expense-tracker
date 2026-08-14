import express from 'express';
import {
  upsertBudget,
  getBudgets,
  getBudgetProgress,
} from '../controllers/budgetController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', upsertBudget);
router.get('/', getBudgets);
router.get('/progress', getBudgetProgress);

export default router;
