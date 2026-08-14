import Budget from '../models/Budget.js';
import Transaction from '../models/Transaction.js';
import mongoose from 'mongoose';

/**
 * @desc    Create or update a budget (Upsert)
 * @route   POST /api/budgets
 * @access  Private
 */
export const upsertBudget = async (req, res, next) => {
  try {
    const { category, limit, month, year } = req.body;

    if (!category || limit === undefined || !month || !year) {
      res.status(400);
      throw new Error('Please fill in category, limit, month, and year fields');
    }

    if (limit < 0) {
      res.status(400);
      throw new Error('Budget limit must be a positive number');
    }

    const budgetMonth = Number(month);
    const budgetYear = Number(year);

    if (budgetMonth < 1 || budgetMonth > 12) {
      res.status(400);
      throw new Error('Month must be between 1 and 12');
    }

    // Upsert: update existing budget or create a new one
    const budget = await Budget.findOneAndUpdate(
      {
        user: req.user._id,
        category,
        month: budgetMonth,
        year: budgetYear,
      },
      { limit },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(200).json(budget);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all budgets for a given month & year
 * @route   GET /api/budgets
 * @access  Private
 */
export const getBudgets = async (req, res, next) => {
  try {
    const month = Number(req.query.month) || new Date().getMonth() + 1;
    const year = Number(req.query.year) || new Date().getFullYear();

    const budgets = await Budget.find({
      user: req.user._id,
      month,
      year,
    });

    res.status(200).json(budgets);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get budget progress compared with actual expenses for a given month & year
 * @route   GET /api/budgets/progress
 * @access  Private
 */
export const getBudgetProgress = async (req, res, next) => {
  try {
    const month = Number(req.query.month) || new Date().getMonth() + 1;
    const year = Number(req.query.year) || new Date().getFullYear();

    // Calculate first and last day of target month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // Get all user budgets for this period
    const budgets = await Budget.find({
      user: req.user._id,
      month,
      year,
    });

    // Aggregate actual expenses by category for this month
    const expenses = await Transaction.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user._id),
          type: 'expense',
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$category',
          totalSpent: { $sum: '$amount' },
        },
      },
    ]);

    // Create a dictionary map for easy expense lookup by category
    const expenseMap = {};
    expenses.forEach((item) => {
      expenseMap[item._id] = item.totalSpent;
    });

    // Build progress reports for each budgeted category
    const progress = budgets.map((budget) => {
      const spent = expenseMap[budget.category] || 0;
      const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
      return {
        _id: budget._id,
        category: budget.category,
        limit: budget.limit,
        spent: Math.round(spent * 100) / 100,
        percentage: Math.round(percentage * 100) / 100,
        isExceeded: spent > budget.limit,
        isNearLimit: spent >= budget.limit * 0.85, // 85% or higher
      };
    });

    // Also compute overall total budget status if budgets exist
    const totalLimit = budgets.reduce((sum, b) => sum + b.limit, 0);
    const totalSpent = Object.values(expenseMap).reduce((sum, spent) => sum + spent, 0);
    const totalPercentage = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;

    res.status(200).json({
      progress,
      totals: {
        limit: Math.round(totalLimit * 100) / 100,
        spent: Math.round(totalSpent * 100) / 100,
        percentage: Math.round(totalPercentage * 100) / 100,
        isExceeded: totalSpent > totalLimit,
        isNearLimit: totalSpent >= totalLimit * 0.85,
      },
    });
  } catch (error) {
    next(error);
  }
};
