const express = require('express');
const router = express.Router();
const dbService = require('../services/dbService');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get aggregated overview statistics for the bank administrator
 */
router.get('/dashboard', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = await dbService.getAdminStats();
    const recentTransactions = (await dbService.getAllTransactions()).slice(0, 10);
    const users = await dbService.getAllUsers();

    res.json({
      success: true,
      stats,
      userCount: users.length,
      recentTransactions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/admin/users
 * @desc    Get all registered users and their current demo account balances
 */
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await dbService.getAllUsers();
    
    // Attach account info for each user
    const usersWithAccounts = await Promise.all(
      users.map(async (u) => {
        const acc = await dbService.getAccountByUserId(u._id || u.id);
        return {
          id: u._id || u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          role: u.role,
          createdAt: u.createdAt,
          accountNumber: acc ? acc.accountNumber : 'N/A',
          balance: acc ? acc.balance : 0,
          currency: 'INR'
        };
      })
    );

    res.json({
      success: true,
      count: usersWithAccounts.length,
      users: usersWithAccounts
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/admin/transactions
 * @desc    Get complete audit log of all system transactions
 */
router.get('/transactions', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const transactions = await dbService.getAllTransactions();
    res.json({
      success: true,
      count: transactions.length,
      transactions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
