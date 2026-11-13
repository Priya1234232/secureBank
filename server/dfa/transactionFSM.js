/**
 * Formal Languages and Automata Theory (FLAT)
 * Transaction Modeling Deterministic Finite Automaton (DFA)
 * 
 * Formal Definition:
 * DFA = (Q, Σ, δ, q0, F)
 * 
 * States:
 *   Q = { INITIATED, APPROVED, REJECTED }
 * 
 * Input Alphabet:
 *   Σ = { VALID_TRANSACTION, INVALID_RECEIVER, INSUFFICIENT_BALANCE, DATABASE_FAILURE }
 * 
 * Initial State:
 *   q0 = INITIATED
 * 
 * Final States:
 *   F = { APPROVED, REJECTED }
 * 
 * Transition Logic:
 *   δ(INITIATED, VALID_TRANSACTION)    → APPROVED
 *   δ(INITIATED, INVALID_RECEIVER)     → REJECTED
 *   δ(INITIATED, INSUFFICIENT_BALANCE) → REJECTED
 *   δ(INITIATED, DATABASE_FAILURE)     → REJECTED
 * 
 * Terminal States:
 *   APPROVED and REJECTED are terminal absorbing states.
 *   DATABASE_FAILURE must never produce an APPROVED transaction.
 */

const TRANSACTION_STATES = {
  INITIATED: 'INITIATED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  // Optional intermediate states supported for step-by-step animations
  VALIDATING: 'VALIDATING',
  COMPLETED: 'APPROVED' // Alias COMPLETED to APPROVED for seamless backward compatibility
};

const TRANSACTION_SYMBOLS = {
  VALID_TRANSACTION: 'VALID_TRANSACTION',
  INVALID_RECEIVER: 'INVALID_RECEIVER',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  DATABASE_FAILURE: 'DATABASE_FAILURE',
  // Legacy symbols mapped gracefully
  DISPATCH_SUBMIT: 'VALIDATING',
  CHECK_PASS: 'VALID_TRANSACTION',
  CHECK_FAIL: 'INSUFFICIENT_BALANCE',
  COMMIT_PASS: 'VALID_TRANSACTION',
  COMMIT_FAIL: 'DATABASE_FAILURE'
};

// Formal Transition Function δ: Q × Σ → Q
const TRANSACTION_DELTA = {
  [TRANSACTION_STATES.INITIATED]: {
    [TRANSACTION_SYMBOLS.VALID_TRANSACTION]: TRANSACTION_STATES.APPROVED,
    [TRANSACTION_SYMBOLS.INVALID_RECEIVER]: TRANSACTION_STATES.REJECTED,
    [TRANSACTION_SYMBOLS.INSUFFICIENT_BALANCE]: TRANSACTION_STATES.REJECTED,
    [TRANSACTION_SYMBOLS.DATABASE_FAILURE]: TRANSACTION_STATES.REJECTED
  },
  [TRANSACTION_STATES.APPROVED]: {
    [TRANSACTION_SYMBOLS.VALID_TRANSACTION]: TRANSACTION_STATES.APPROVED,
    [TRANSACTION_SYMBOLS.INVALID_RECEIVER]: TRANSACTION_STATES.APPROVED,
    [TRANSACTION_SYMBOLS.INSUFFICIENT_BALANCE]: TRANSACTION_STATES.APPROVED,
    [TRANSACTION_SYMBOLS.DATABASE_FAILURE]: TRANSACTION_STATES.APPROVED
  },
  [TRANSACTION_STATES.REJECTED]: {
    [TRANSACTION_SYMBOLS.VALID_TRANSACTION]: TRANSACTION_STATES.REJECTED,
    [TRANSACTION_SYMBOLS.INVALID_RECEIVER]: TRANSACTION_STATES.REJECTED,
    [TRANSACTION_SYMBOLS.INSUFFICIENT_BALANCE]: TRANSACTION_STATES.REJECTED,
    [TRANSACTION_SYMBOLS.DATABASE_FAILURE]: TRANSACTION_STATES.REJECTED
  }
};

const ALLOWED_TRANSITIONS = {
  [TRANSACTION_STATES.INITIATED]: [
    TRANSACTION_STATES.APPROVED,
    TRANSACTION_STATES.REJECTED,
    'VALIDATING' // Allowed intermediate step
  ],
  ['VALIDATING']: [
    TRANSACTION_STATES.APPROVED,
    TRANSACTION_STATES.REJECTED
  ],
  [TRANSACTION_STATES.APPROVED]: [], // Terminal state
  [TRANSACTION_STATES.REJECTED]: []  // Terminal state
};

const TRANSACTION_DFA_METADATA = {
  name: 'SecureBank Transaction State Machine DFA',
  description: 'Deterministic Finite Automaton governing monetary transfers and settlement states.',
  tuple: {
    Q: ['INITIATED', 'APPROVED', 'REJECTED'],
    Sigma: ['VALID_TRANSACTION', 'INVALID_RECEIVER', 'INSUFFICIENT_BALANCE', 'DATABASE_FAILURE'],
    q0: 'INITIATED',
    F: ['APPROVED', 'REJECTED']
  },
  stateDescriptions: {
    INITIATED: {
      label: 'INITIATED (q0)',
      color: 'blue',
      hex: '#00B4D8',
      role: 'Initial State: Transaction request captured from client; validation commences.',
      isInitial: true,
      isFinal: false,
      isTerminal: false
    },
    APPROVED: {
      label: 'APPROVED (q_app ∈ F)',
      color: 'green',
      hex: '#10B981',
      role: 'Final Accepting State: Validation passed and funds committed atomically to ledger.',
      isInitial: false,
      isFinal: true,
      isTerminal: true
    },
    REJECTED: {
      label: 'REJECTED (q_rej ∈ F)',
      color: 'red',
      hex: '#EF4444',
      role: 'Terminal Trap State: Invalid recipient, insufficient balance, or database failure trapped.',
      isInitial: false,
      isFinal: true,
      isTerminal: true
    }
  }
};

class TransactionFSM {
  constructor(initialState = TRANSACTION_STATES.INITIATED) {
    this.state = initialState;
    this.history = [{
      state: this.state,
      timestamp: new Date().toISOString(),
      reason: 'Transaction initialized in state INITIATED (q0)'
    }];
  }

  canTransitionTo(nextState) {
    if (this.state === nextState) return true;
    const allowed = ALLOWED_TRANSITIONS[this.state] || [];
    return allowed.includes(nextState);
  }

  transition(nextState, reason = '') {
    // Normalize aliases
    const targetState = nextState === 'COMPLETED' ? TRANSACTION_STATES.APPROVED : nextState;

    if (!this.canTransitionTo(targetState)) {
      throw new Error(`Invalid DFA transition: cannot transition from ${this.state} to ${targetState}`);
    }

    this.state = targetState;
    this.history.push({
      state: this.state,
      timestamp: new Date().toISOString(),
      reason: reason || `Transitioned to state ${this.state}`
    });

    return {
      currentState: this.state,
      history: this.history
    };
  }

  processSymbol(symbol, reason = '') {
    const currentState = this.state === 'VALIDATING' ? TRANSACTION_STATES.INITIATED : this.state;
    const nextState = TRANSACTION_DELTA[currentState] && TRANSACTION_DELTA[currentState][symbol];

    if (!nextState) {
      throw new Error(`Invalid DFA input symbol "${symbol}" for state ${this.state}`);
    }

    return this.transition(nextState, reason || `Processed input symbol ${symbol}`);
  }

  getState() {
    return this.state;
  }

  getHistory() {
    return this.history;
  }
}

function getTransactionDFADefinition() {
  const states = ['INITIATED', 'APPROVED', 'REJECTED'];
  const symbols = ['VALID_TRANSACTION', 'INVALID_RECEIVER', 'INSUFFICIENT_BALANCE', 'DATABASE_FAILURE'];

  const table = states.map(st => {
    const row = {
      state: st,
      isInitial: st === 'INITIATED',
      isFinal: st === 'APPROVED' || st === 'REJECTED',
      isTerminal: st !== 'INITIATED',
      transitions: {}
    };
    for (const sym of symbols) {
      row.transitions[sym] = TRANSACTION_DELTA[st][sym];
    }
    return row;
  });

  return {
    ...TRANSACTION_DFA_METADATA,
    transitionTable: table,
    delta: TRANSACTION_DELTA
  };
}

module.exports = {
  TRANSACTION_STATES,
  TRANSACTION_SYMBOLS,
  TRANSACTION_DELTA,
  ALLOWED_TRANSITIONS,
  TransactionFSM,
  getTransactionDFADefinition
};
