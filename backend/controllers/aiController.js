import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import mongoose from 'mongoose';

/**
 * Helper function to call the Gemini API
 * @param {string} prompt - Prompt sent to the model
 * @returns {Promise<string>} - Text response from the Gemini API
 */
const callGemini = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey === 'your_gemini_api_key') {
    throw new Error('Gemini API key is missing. Please add GEMINI_API_KEY in your backend/.env file to activate AI features.');
  }

  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent';
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      const sanitizedError = apiKey ? errorText.split(apiKey).join('[REDACTED]') : errorText;
      throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${sanitizedError}`);
    }

    const data = await response.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return textResponse || 'No response from the financial assistant.';
  } catch (error) {
    const sanitizedMsg = apiKey ? error.message.split(apiKey).join('[REDACTED]') : error.message;
    throw new Error(sanitizedMsg);
  }
};

/**
 * Helper to build user financial context string for the AI prompt
 */
const getFinancialContext = async (userId) => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const startDate = new Date(currentYear, currentMonth - 1, 1);
  const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

  // 1. Get recent transactions (last 30 days)
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);

  const transactions = await Transaction.find({
    user: userId,
    date: { $gte: last30Days }
  }).sort({ date: -1 });

  // 2. Aggregate spending by category for current month
  const categorySpending = await Transaction.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
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

  // 3. Get budgets for current month
  const budgets = await Budget.find({
    user: userId,
    month: currentMonth,
    year: currentYear,
  });

  // Calculate totals
  let totalIncome = 0;
  let totalExpense = 0;

  // We calculate from current month transactions
  const currentMonthTxs = await Transaction.find({
    user: userId,
    date: { $gte: startDate, $lte: endDate }
  });

  currentMonthTxs.forEach((tx) => {
    if (tx.type === 'income') {
      totalIncome += tx.amount;
    } else {
      totalExpense += tx.amount;
    }
  });

  // Format context text
  // Format context text
  let context = `USER FINANCIAL CONTEXT (Current Period: Month ${currentMonth}, Year ${currentYear})\n`;
  context += `Summary stats for this month:\n`;
  context += `- Total Income: ₹${totalIncome.toFixed(2)}\n`;
  context += `- Total Expense: ₹${totalExpense.toFixed(2)}\n`;
  context += `- Balance: ₹${(totalIncome - totalExpense).toFixed(2)}\n`;
  context += `- Savings Rate: ${totalIncome > 0 ? (((totalIncome - totalExpense) / totalIncome) * 100).toFixed(1) : 0}%\n\n`;

  context += `Expenses Category-wise breakdown this month:\n`;
  if (categorySpending.length === 0) {
    context += `- No expenses logged this month yet.\n`;
  } else {
    categorySpending.forEach((item) => {
      context += `- ${item._id}: ₹${item.totalSpent.toFixed(2)}\n`;
    });
  }
  context += `\n`;

  context += `Set Monthly Budgets:\n`;
  if (budgets.length === 0) {
    context += `- No category budgets configured yet.\n`;
  } else {
    budgets.forEach((b) => {
      const actualSpend = categorySpending.find((item) => item._id === b.category)?.totalSpent || 0;
      context += `- ${b.category}: Limit ₹${b.limit.toFixed(2)} (Spent so far: ₹${actualSpend.toFixed(2)})\n`;
    });
  }
  context += `\n`;

  context += `Recent 10 Transactions (last 30 days):\n`;
  if (transactions.length === 0) {
    context += `- No transactions logged in the last 30 days.\n`;
  } else {
    transactions.slice(0, 10).forEach((tx) => {
      const dateStr = new Date(tx.date).toISOString().split('T')[0];
      context += `- [${dateStr}] ${tx.type.toUpperCase()}: ${tx.category} - ₹${tx.amount.toFixed(2)} (${tx.description || 'No description'})\n`;
    });
  }

  return context;
};

/**
 * @desc    Generate financial insights (static spending analysis)
 * @route   GET /api/ai/insights
 * @access  Private
 */
export const getAIInsights = async (req, res, next) => {
  try {
    const context = await getFinancialContext(req.user._id);

    const prompt = `
You are an expert AI Financial Planner and wealth management coach. 
Analyze the following financial context of a user and generate:
1. **Spending Analysis**: Highlight where the user is spending the most in INR (₹) and if there are any unusual patterns or warning flags (e.g., categories near or exceeding budgets).
2. **Savings Opportunities**: Provide 3 specific, actionable recommendations on how the user can reduce expenses and increase their savings rate based on their transaction history.
3. **Budget Recommendations**: Advise on whether current budget limits in INR (₹) are realistic or need adjustment, and suggest limits for unbudgeted categories if needed.

Keep the advice practical, supportive, and direct. Always format currency in INR (₹). Use bullet points and professional formatting. Return the response in Markdown format.

${context}
    `;

    const insights = await callGemini(prompt);
    res.status(200).json({ insights });
  } catch (error) {
    // Graceful error check for missing API keys
    if (error.message.includes('Gemini API key') || error.message.includes('API key')) {
      res.status(200).json({
        insights: `### AI Financial Insights (Demo Mode)\n\n> 💡 **AI Insight Key Required:** To receive real-time AI spending audits, please add a valid Gemini API Key to your \`backend/.env\` as \`GEMINI_API_KEY\`.\n\nHere are standard financial suggestions based on your data:\n\n* **Budget Compliance**: Regularly review categories like Dining or Shopping which tend to fluctuate.\n* **Savings Rule**: Aim to set aside at least **20%** of your monthly income before calculating discretionary budgets.\n* **Emergency Fund**: Maintain a cash cushion covering **3 to 6 months** of mandatory living expenses.`,
      });
    } else {
      next(error);
    }
  }
};

/**
 * @desc    Interactive chatbot conversation
 * @route   POST /api/ai/chat
 * @access  Private
 */
export const chatWithAI = async (req, res, next) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      res.status(400);
      throw new Error('Please provide a message');
    }

    const context = await getFinancialContext(req.user._id);

    // Format chat history context if provided
    let chatHistoryStr = '';
    if (history && Array.isArray(history)) {
      chatHistoryStr = 'Previous Conversation History:\n';
      history.slice(-6).forEach((item) => {
        chatHistoryStr += `${item.role === 'user' ? 'User' : 'Assistant'}: ${item.content}\n`;
      });
      chatHistoryStr += '\n';
    }

    const prompt = `
You are "SmartFinance AI", the assistant for the Smart Expense Tracker.
You must ONLY answer questions directly related to: income, expenses, budgets, savings, transactions, and analytics, using the real user data provided in the user's profile in INR (₹).

If the user's question is NOT about these topics, or is unrelated to their Smart Expense Tracker (for example, general knowledge, programming, weather, general math, jokes, or anything not directly about their personal finance tracking), you MUST reply EXACTLY with this text and absolutely nothing else:
"I can only answer questions related to your Smart Expense Tracker."

User's Financial Profile:
${context}

${chatHistoryStr}
User's Question: "${message}"

Rules:
1. You must only answer questions about the user's income, expenses, budgets, savings, transactions, and financial analytics.
2. For any unrelated or out-of-scope questions, your entire response must be exactly: "I can only answer questions related to your Smart Expense Tracker." Do not add any greeting, explanation, or extra characters.
3. Use the real user data in INR (₹) for context. Always format currency as ₹ (INR), never use $ (USD).
4. Provide a professional, encouraging, and clear answer.
5. Limit your response to 2-3 short paragraphs or clean bullet points.
6. Output your answer using clean Markdown.
    `;

    const reply = await callGemini(prompt);
    res.status(200).json({ reply });
  } catch (error) {
    if (error.message.includes('Gemini API key') || error.message.includes('API key')) {
      const relatedKeywords = [
        'income', 'expense', 'budget', 'saving', 'transaction', 'analytic',
        'spending', 'spent', 'earn', 'salary', 'finance', 'money', 'cost',
        'chart', 'graph', 'report', 'balance', 'track', 'category', 'dining',
        'shopping', 'groceries', 'rent', 'utilities', 'bills', 'rupee', 'inr', '₹'
      ];
      const messageLower = message.toLowerCase();
      const isRelated = relatedKeywords.some(keyword => messageLower.includes(keyword)) ||
        /₹|amount|total|sum|history|show|list|how much/i.test(messageLower);

      if (!isRelated) {
        res.status(200).json({
          reply: "I can only answer questions related to your Smart Expense Tracker."
        });
      } else {
        res.status(200).json({
          reply: `Hello! I'm SmartFinance AI. It looks like the Gemini API Key is not set up in the backend yet. Ask your developer to add a \`GEMINI_API_KEY\` to the \`backend/.env\` file.\n\nWithout the API key, I can still tell you that based on your records, your current net savings rate is calculated by comparing your logged income against your expenses! Let me know if you want tips on manual budget setting!`,
        });
      }
    } else {
      next(error);
    }
  }
};
