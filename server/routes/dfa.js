const express = require('express');
const router = express.Router();
const { loginDFA, loginDFADefinition } = require('../dfa/loginDFA');
const { 
  getTransactionDFADefinition, 
  TransactionFSM, 
  TRANSACTION_STATES, 
  TRANSACTION_DELTA 
} = require('../dfa/transactionFSM');

/**
 * @route   GET /api/dfa/transaction-dfa
 * @desc    Get formal mathematical definition of the Transaction Modeling DFA
 */
router.get('/transaction-dfa', (req, res) => {
  const transactionDFA = getTransactionDFADefinition();
  res.json({
    success: true,
    definition: transactionDFA
  });
});

/**
 * @route   POST /api/dfa/transaction-simulate
 * @desc    Simulate custom event sequence through Transaction DFA
 */
router.post('/transaction-simulate', (req, res) => {
  const { events } = req.body;
  const fsm = new TransactionFSM(TRANSACTION_STATES.INITIATED);

  if (Array.isArray(events)) {
    for (const evt of events) {
      if (fsm.canTransitionTo(evt)) {
        fsm.transition(evt, `Simulated event transition to ${evt}`);
      }
    }
  }

  res.json({
    success: true,
    finalState: fsm.getState(),
    isAccepted: fsm.getState() === TRANSACTION_STATES.COMPLETED,
    isRejected: fsm.getState() === TRANSACTION_STATES.REJECTED,
    history: fsm.getHistory()
  });
});

/**
 * @route   GET /api/dfa/definition
 * @desc    Get formal mathematical definition of the Login Credential DFA
 */
router.get('/definition', (req, res) => {
  res.json({
    success: true,
    definition: {
      name: loginDFADefinition.name,
      description: loginDFADefinition.description,
      tuple: {
        Q: loginDFADefinition.states,
        Sigma: loginDFADefinition.alphabet,
        q0: loginDFADefinition.initialState,
        F: loginDFADefinition.finalStates,
        deadState: loginDFADefinition.deadState
      },
      stateMetadata: loginDFADefinition.stateMetadata,
      transitionTable: loginDFA.getTransitionTable(),
      transitions: loginDFADefinition.transitions
    }
  });
});

/**
 * @route   POST /api/dfa/simulate
 * @desc    Simulate DFA execution on custom string input
 */
router.post('/simulate', (req, res) => {
  const { input } = req.body;
  if (input === undefined || input === null) {
    return res.status(400).json({ success: false, message: 'Input string is required' });
  }

  const result = loginDFA.run(String(input));

  res.json({
    success: true,
    result
  });
});

/**
 * @route   GET /api/dfa/presets
 * @desc    Get curated benchmark strings for demonstration
 */
router.get('/presets', (req, res) => {
  const presets = [
    { label: 'Valid Standard Account', input: 'rahul@securebank.com', expected: true, note: 'Fully accepted format with domain and tld' },
    { label: 'Valid Minimal Identifier', input: 'priya10@sb.in', expected: true, note: 'Valid alphanumeric username and domain' },
    { label: 'Valid Admin Email', input: 'admin@secbank.org', expected: true, note: 'Proper separator and structure' },
    { label: 'Invalid: Missing "@" Separator', input: 'rahuldomain.com', expected: false, note: 'Stays in q1 or fails to reach separator q2' },
    { label: 'Invalid: Multiple "@" Symbols', input: 'user@@securebank.com', expected: false, note: 'Second @ transitions directly to trap state qR' },
    { label: 'Invalid: Starts with Disallowed Character', input: '@securebank.com', expected: false, note: 'Initial symbol from q0 is not alphanumeric; transitions to qR' },
    { label: 'Invalid: Incomplete Domain', input: 'kaviarasu@', expected: false, note: 'Halts in non-accepting state q2' },
    { label: 'Invalid: Special Disallowed Symbols', input: 'user$#*@bank.com', expected: false, note: 'Disallowed characters trigger immediate transition to trap state qR' }
  ];

  res.json({
    success: true,
    presets
  });
});

module.exports = router;
