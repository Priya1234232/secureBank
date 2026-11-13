const express = require('express');
const router = express.Router();
const dbService = require('../services/dbService');
const { authenticateToken } = require('../middleware/auth');
const { TransactionFSM, TRANSACTION_STATES, TRANSACTION_SYMBOLS } = require('../dfa/transactionFSM');

/**
 * @route   POST /api/transactions/deposit
 * @desc    Simulated deposit in Indian Rupees (₹)
 */
router.post('/deposit', authenticateToken, async (req, res) => {
  try {
    const { amount, description } = req.body;
    const numAmount = Number(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Deposit amount must be a positive number greater than ₹0'
      });
    }

    const userAccount = await dbService.getAccountByUserId(req.user._id || req.user.id);
    if (!userAccount) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    // FSM progression for deposit
    const fsm = new TransactionFSM(TRANSACTION_STATES.INITIATED);
    fsm.transition(TRANSACTION_STATES.VALIDATING, 'Validating cash-in simulated deposit credentials');
    fsm.transition(TRANSACTION_STATES.APPROVED, 'Deposit authorized by central reserve');

    // Deposit money
    const updatedAccount = await dbService.depositMoney(userAccount.accountNumber, numAmount);

    fsm.transition(TRANSACTION_STATES.COMPLETED, 'Funds credited to ledger');

    const txId = 'DEP' + Date.now().toString().slice(-8) + Math.random().toString(36).substring(2, 4).toUpperCase();
    const transaction = await dbService.createTransaction({
      transactionId: txId,
      senderAccount: 'CASH_DEPOSIT_TERMINAL',
      receiverAccount: userAccount.accountNumber,
      amount: numAmount,
      type: 'DEPOSIT',
      description: description || 'Simulated Cash/UPI Deposit',
      status: TRANSACTION_STATES.COMPLETED,
      fsmHistory: fsm.getHistory(),
      createdAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: `Successfully deposited ₹${numAmount.toLocaleString('en-IN')}`,
      transaction,
      newBalance: updatedAccount.balance,
      fsmHistory: fsm.getHistory()
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/transactions/transfer
 * @desc    Money transfer strictly governed by FLAT Transaction DFA M_trans = (Q, Σ, δ, q0, F)
 */
router.post('/transfer', authenticateToken, async (req, res) => {
  const fsm = new TransactionFSM(TRANSACTION_STATES.INITIATED);

  try {
    const { receiverAccount, amount, description } = req.body;
    const numAmount = Number(amount);

    // 1. Validate transfer amount (positive, non-zero)
    if (isNaN(numAmount) || numAmount <= 0) {
      fsm.processSymbol(TRANSACTION_SYMBOLS.INSUFFICIENT_BALANCE, 'Invalid transfer amount: must be positive number > ₹0');
      return res.status(400).json({
        success: false,
        message: 'Transfer amount must be greater than ₹0',
        fsmState: fsm.getState(),
        fsmHistory: fsm.getHistory()
      });
    }

    // 2. Lookup sender account
    const senderAcc = await dbService.getAccountByUserId(req.user._id || req.user.id);
    if (!senderAcc) {
      fsm.processSymbol(TRANSACTION_SYMBOLS.DATABASE_FAILURE, 'Sender account not found in registry');
      return res.status(404).json({
        success: false,
        message: 'Sender account not found',
        fsmState: fsm.getState(),
        fsmHistory: fsm.getHistory()
      });
    }

    // 3. Prevent transferring to self
    if (!receiverAccount || typeof receiverAccount !== 'string' || senderAcc.accountNumber === receiverAccount.trim()) {
      fsm.processSymbol(TRANSACTION_SYMBOLS.INVALID_RECEIVER, 'Recipient account identical to sender or invalid format');
      const rejectedTx = await dbService.recordRejectedTransfer({
        senderAccount: senderAcc.accountNumber,
        receiverAccount: receiverAccount ? receiverAccount.trim() : 'INVALID',
        amount: numAmount,
        description: description || 'Transfer to same account or empty recipient',
        fsmHistory: fsm.getHistory(),
        reason: 'Sender and receiver accounts cannot be identical'
      });
      return res.status(400).json({
        success: false,
        message: 'You cannot transfer funds to your own account or specify an empty recipient',
        fsmState: fsm.getState(),
        transaction: rejectedTx,
        fsmHistory: fsm.getHistory()
      });
    }

    const cleanReceiverAccount = receiverAccount.trim();

    // 4. Verify recipient account exists
    const recipientAcc = await dbService.getAccountByNumber(cleanReceiverAccount);
    if (!recipientAcc) {
      fsm.processSymbol(TRANSACTION_SYMBOLS.INVALID_RECEIVER, `Recipient account ${cleanReceiverAccount} does not exist in registry`);
      const rejectedTx = await dbService.recordRejectedTransfer({
        senderAccount: senderAcc.accountNumber,
        receiverAccount: cleanReceiverAccount,
        amount: numAmount,
        description: description || 'Transfer to non-existent account',
        fsmHistory: fsm.getHistory(),
        reason: `Recipient account ${cleanReceiverAccount} not found`
      });
      return res.status(404).json({
        success: false,
        message: `Recipient account ${cleanReceiverAccount} does not exist`,
        fsmState: fsm.getState(),
        transaction: rejectedTx,
        fsmHistory: fsm.getHistory()
      });
    }

    // 5. Verify sender balance sufficiency
    if (senderAcc.balance < numAmount) {
      fsm.processSymbol(
        TRANSACTION_SYMBOLS.INSUFFICIENT_BALANCE, 
        `Overdraft violation: Requested ₹${numAmount.toLocaleString('en-IN')} exceeds available balance ₹${senderAcc.balance.toLocaleString('en-IN')}`
      );
      const rejectedTx = await dbService.recordRejectedTransfer({
        senderAccount: senderAcc.accountNumber,
        receiverAccount: cleanReceiverAccount,
        amount: numAmount,
        description: description || 'Transfer rejected due to insufficient balance',
        fsmHistory: fsm.getHistory(),
        reason: 'Insufficient balance'
      });
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. You have ₹${senderAcc.balance.toLocaleString('en-IN')} available.`,
        fsmState: fsm.getState(),
        transaction: rejectedTx,
        fsmHistory: fsm.getHistory()
      });
    }

    // 6. Validation passed! Transition: INITIATED + VALID_TRANSACTION → APPROVED
    fsm.processSymbol(TRANSACTION_SYMBOLS.VALID_TRANSACTION, 'Validation passed. Funds authorized and committed atomically to ledger.');

    // Step 7: Atomic Database Commit
    const result = await dbService.atomicTransfer({
      senderAccount: senderAcc.accountNumber,
      receiverAccount: recipientAcc.accountNumber,
      amount: numAmount,
      description: description || 'Peer-to-peer bank transfer',
      fsmHistory: fsm.getHistory()
    });

    res.status(201).json({
      success: true,
      message: `Successfully transferred ₹${numAmount.toLocaleString('en-IN')} to ${recipientAcc.accountNumber}`,
      transaction: result.transaction,
      newBalance: result.senderBalance,
      fsmState: fsm.getState(),
      fsmHistory: fsm.getHistory()
    });
  } catch (error) {
    if (fsm.canTransitionTo(TRANSACTION_STATES.REJECTED)) {
      fsm.processSymbol(TRANSACTION_SYMBOLS.DATABASE_FAILURE, error.message);
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Transfer failed',
      fsmState: fsm.getState(),
      fsmHistory: fsm.getHistory()
    });
  }
});

/**
 * @route   GET /api/transactions/:id/status
 * @desc    Get detailed DFA state and verification history for a transaction (FLAT & CN requirement)
 */
router.get('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const tx = await dbService.getTransactionById(id);

    if (!tx) {
      return res.status(404).json({
        success: false,
        message: `Transaction "${id}" not found in ledger`
      });
    }

    const isApproved = tx.status === 'APPROVED' || tx.status === 'COMPLETED';

    res.json({
      success: true,
      transactionId: tx.transactionId,
      status: isApproved ? 'APPROVED' : tx.status,
      fsmState: isApproved ? 'APPROVED' : tx.status,
      amount: tx.amount,
      currency: 'INR',
      senderAccount: tx.senderAccount,
      receiverAccount: tx.receiverAccount,
      description: tx.description,
      fsmHistory: tx.fsmHistory || [],
      validationResult: isApproved 
        ? 'VALID_TRANSACTION: Recipient account verified, balance sufficient, database atomic commit confirmed.'
        : `REJECTED: ${tx.description || 'Validation failed. Balances unchanged.'}`,
      createdAt: tx.createdAt
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/transactions/history
 * @desc    Fetch transactions for the logged in user with search & filter
 */
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userAccount = await dbService.getAccountByUserId(req.user._id || req.user.id);
    if (!userAccount) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    const { type, status, search } = req.query;
    let transactions = await dbService.getTransactionsForAccount(userAccount.accountNumber);

    // Apply filtering
    if (type && type !== 'ALL') {
      transactions = transactions.filter(t => t.type === type.toUpperCase());
    }
    if (status && status !== 'ALL') {
      transactions = transactions.filter(t => t.status === status.toUpperCase());
    }
    if (search) {
      const q = search.toLowerCase();
      transactions = transactions.filter(t => 
        t.transactionId.toLowerCase().includes(q) ||
        t.senderAccount.toLowerCase().includes(q) ||
        t.receiverAccount.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q))
      );
    }

    res.json({
      success: true,
      accountNumber: userAccount.accountNumber,
      totalCount: transactions.length,
      transactions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
