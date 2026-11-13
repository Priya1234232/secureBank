const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dbService = require('../services/dbService');
const { loginDFA } = require('../dfa/loginDFA');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');
const { validateIdentifierDFA } = require('../middleware/dfaValidator');

// Helper to generate a demo 12-digit Indian Bank account number
function generateAccountNumber() {
  return 'SB' + Math.floor(1000000000 + Math.random() * 9000000000);
}

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user, create demo bank account with ₹ INR balance
 */
router.post('/register', validateIdentifierDFA, async (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword } = req.body;

    // Validation
    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields (name, email, phone, password) are required'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check existing
    const existing = await dbService.findUserByEmail(email);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await dbService.createUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      passwordHash,
      role: 'user'
    });

    // Create initial demo account with ₹50,000 INR
    const newAccount = await dbService.createAccount({
      userId: newUser._id,
      accountNumber: generateAccountNumber(),
      balance: 50000,
      currency: 'INR'
    });

    // Create initial welcome transaction
    await dbService.createTransaction({
      transactionId: 'TXN_WELCOME_' + Date.now().toString().slice(-6),
      senderAccount: 'SECUREBANK_CENTRAL',
      receiverAccount: newAccount.accountNumber,
      amount: 50000,
      type: 'DEPOSIT',
      description: 'Welcome promotional deposit',
      status: 'COMPLETED',
      fsmHistory: [{ state: 'COMPLETED', timestamp: new Date().toISOString(), reason: 'Initial account funding' }]
    });

    // Issue JWT
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Account registered successfully with ₹50,000 demo balance',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role
      },
      account: {
        accountNumber: newAccount.accountNumber,
        balance: newAccount.balance,
        currency: 'INR'
      },
      dfaValidation: req.dfaValidation
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration'
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user using DFA verification + bcrypt + JWT
 */
router.post('/login', validateIdentifierDFA, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    // Step 1: Look up user
    const user = await dbService.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials',
        dfaValidation: req.dfaValidation
      });
    }

    // Step 2: Cryptographic Password Verification with bcrypt
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials',
        dfaValidation: req.dfaValidation
      });
    }

    // Step 3: Fetch linked account
    const account = await dbService.getAccountByUserId(user._id);

    // Step 4: Issue JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Authentication successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      },
      account: account ? {
        accountNumber: account.accountNumber,
        balance: account.balance,
        currency: account.currency
      } : null,
      dfaValidation: req.dfaValidation
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during login'
    });
  }
});

/**
 * @route   GET /api/auth/profile
 * @desc    Get currently logged in user profile and account details
 */
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const account = await dbService.getAccountByUserId(req.user._id || req.user.id);
    res.json({
      success: true,
      user: {
        id: req.user._id || req.user.id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role,
        createdAt: req.user.createdAt
      },
      account: account ? {
        accountNumber: account.accountNumber,
        balance: account.balance,
        currency: account.currency
      } : null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch user profile'
    });
  }
});

module.exports = router;
