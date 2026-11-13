const express = require('express');
const router = express.Router();
const dbService = require('../services/dbService');
const { authenticateToken } = require('../middleware/auth');

/**
 * @route   GET /api/accounts
 * @desc    Get current user's account
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const account = await dbService.getAccountByUserId(req.user._id || req.user.id);
    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found for user' });
    }
    res.json({
      success: true,
      account
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/accounts/balance
 * @desc    Get account balance in INR
 */
router.get('/balance', authenticateToken, async (req, res) => {
  try {
    const account = await dbService.getAccountByUserId(req.user._id || req.user.id);
    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }
    res.json({
      success: true,
      accountNumber: account.accountNumber,
      balance: account.balance,
      currency: 'INR'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/accounts/lookup/:accountNumber
 * @desc    Verify if recipient account exists and return recipient account name
 */
router.get('/lookup/:accountNumber', authenticateToken, async (req, res) => {
  try {
    const { accountNumber } = req.params;
    const account = await dbService.getAccountByNumber(accountNumber);
    if (!account) {
      return res.status(404).json({
        success: false,
        message: `Account "${accountNumber}" not found in SecureBank registry`
      });
    }

    const user = await dbService.findUserById(account.userId);

    res.json({
      success: true,
      accountNumber: account.accountNumber,
      holderName: user ? user.name : 'Verified SecureBank Holder',
      currency: 'INR'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
