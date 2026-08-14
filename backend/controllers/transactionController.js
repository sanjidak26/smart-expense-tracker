import Transaction from '../models/Transaction.js';
import mongoose from 'mongoose';

/**
 * @desc    Create new transaction
 * @route   POST /api/transactions
 * @access  Private
 */
export const createTransaction = async (req, res, next) => {
  try {
    const { type, amount, category, date, description } = req.body;

    if (!type || !amount || !category) {
      res.status(400);
      throw new Error('Please fill in type, amount, and category fields');
    }

    if (amount <= 0) {
      res.status(400);
      throw new Error('Amount must be greater than zero');
    }

    const transaction = await Transaction.create({
      user: req.user._id,
      type,
      amount,
      category,
      date: date || new Date(),
      description: description || '',
    });

    res.status(201).json(transaction);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user transactions with filters & search
 * @route   GET /api/transactions
 * @access  Private
 */
export const getTransactions = async (req, res, next) => {
  try {
    const { type, category, startDate, endDate, search, page = 1, limit = 20 } = req.query;

    const query = { user: req.user._id };

    // Apply type filter
    if (type && type !== 'all') {
      query.type = type;
    }

    // Apply category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    // Apply date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        // Set to end of day to include all transactions on that day
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    // Apply search filter (description or category)
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const count = await Transaction.countDocuments(query);
    const pages = Math.ceil(count / limit);
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find(query)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      transactions,
      page: Number(page),
      pages: pages || 1,
      total: count,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single transaction by ID
 * @route   GET /api/transactions/:id
 * @access  Private
 */
export const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      res.status(404);
      throw new Error('Transaction not found');
    }

    // Verify ownership
    if (transaction.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to access this transaction');
    }

    res.status(200).json(transaction);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a transaction
 * @route   PUT /api/transactions/:id
 * @access  Private
 */
export const updateTransaction = async (req, res, next) => {
  try {
    const { type, amount, category, date, description } = req.body;

    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      res.status(404);
      throw new Error('Transaction not found');
    }

    // Verify ownership
    if (transaction.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to modify this transaction');
    }

    if (amount !== undefined && amount <= 0) {
      res.status(400);
      throw new Error('Amount must be greater than zero');
    }

    transaction.type = type || transaction.type;
    transaction.amount = amount !== undefined ? amount : transaction.amount;
    transaction.category = category || transaction.category;
    transaction.date = date || transaction.date;
    transaction.description = description !== undefined ? description : transaction.description;

    const updatedTransaction = await transaction.save();
    res.status(200).json(updatedTransaction);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a transaction
 * @route   DELETE /api/transactions/:id
 * @access  Private
 */
export const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      res.status(404);
      throw new Error('Transaction not found');
    }

    // Verify ownership
    if (transaction.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to delete this transaction');
    }

    await transaction.deleteOne();
    res.status(200).json({ id: req.params.id, message: 'Transaction removed successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get financial summary (Total Income, Expenses, Balance, Savings Rate)
 * @route   GET /api/transactions/summary
 * @access  Private
 */
export const getTransactionSummary = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const result = await Transaction.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$type', total: { $sum: '$amount' } } },
    ]);

    let income = 0;
    let expense = 0;

    result.forEach((item) => {
      if (item._id === 'income') {
        income = item.total;
      } else if (item._id === 'expense') {
        expense = item.total;
      }
    });

    const balance = income - expense;
    const savings = income - expense;
    const savingsRate = income > 0 ? (savings / income) * 100 : 0;

    res.status(200).json({
      income: Math.round(income * 100) / 100,
      expense: Math.round(expense * 100) / 100,
      balance: Math.round(balance * 100) / 100,
      savings: Math.round(savings * 100) / 100,
      savingsRate: Math.max(0, Math.round(savingsRate * 100) / 100),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Export transactions to CSV
 * @route   GET /api/transactions/export/csv
 * @access  Private
 */
export const exportTransactionsCSV = async (req, res, next) => {
  try {
    // Get all user transactions, sorted by date descending
    const transactions = await Transaction.find({ user: req.user._id }).sort({ date: -1 });

    let csvContent = 'Date,Type,Category,Amount,Description\n';
    
    transactions.forEach((tx) => {
      const dateStr = new Date(tx.date).toISOString().split('T')[0];
      const desc = tx.description ? tx.description.replace(/"/g, '""') : '';
      csvContent += `${dateStr},${tx.type},"${tx.category}",${tx.amount},"${desc}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=financial_report_${new Date().toISOString().split('T')[0]}.csv`);
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};
