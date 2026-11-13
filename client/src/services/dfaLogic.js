/**
 * Client-Side Formal Languages & Automata Theory (FLAT) DFA Engine
 * Model: M = (Q, Σ, δ, q0, F)
 */

export const DFA_DEFINITION = {
  name: 'SecureBank Login Credential DFA',
  states: ['q0', 'q1', 'q2', 'q3', 'q4', 'qR'],
  alphabet: ['alphanumeric', 'at', 'dot', 'symbol', 'other'],
  initialState: 'q0',
  finalStates: ['q4'],
  deadState: 'qR',
  stateMetadata: {
    q0: { 
      id: 'q0', 
      label: 'q0: Start', 
      name: 'Initial State', 
      desc: 'Waiting for identifier prefix [a-zA-Z0-9]', 
      x: 80, 
      y: 140, 
      isInitial: true, 
      isFinal: false 
    },
    q1: { 
      id: 'q1', 
      label: 'q1: Identifier', 
      name: 'Valid Username Prefix', 
      desc: 'Consuming alphanumeric username characters', 
      x: 230, 
      y: 140, 
      isInitial: false, 
      isFinal: false 
    },
    q2: { 
      id: 'q2', 
      label: 'q2: Separator', 
      name: 'Delimiter Detected', 
      desc: 'Encountered single "@" separator symbol', 
      x: 390, 
      y: 140, 
      isInitial: false, 
      isFinal: false 
    },
    q3: { 
      id: 'q3', 
      label: 'q3: Domain', 
      name: 'Bank Realm / Domain', 
      desc: 'Consuming banking domain characters', 
      x: 550, 
      y: 140, 
      isInitial: false, 
      isFinal: false 
    },
    q4: { 
      id: 'q4', 
      label: 'q4: Accepted', 
      name: 'Accepted State', 
      desc: 'Valid banking credential identifier format verified', 
      x: 710, 
      y: 140, 
      isInitial: false, 
      isFinal: true 
    },
    qR: { 
      id: 'qR', 
      label: 'qR: Rejected', 
      name: 'Dead / Trap State', 
      desc: 'Syntax violation: non-conforming character or misplaced delimiter', 
      x: 390, 
      y: 280, 
      isInitial: false, 
      isFinal: false, 
      isDead: true 
    }
  },
  transitions: {
    q0: { alphanumeric: 'q1', at: 'qR', dot: 'qR', symbol: 'qR', other: 'qR' },
    q1: { alphanumeric: 'q1', symbol: 'q1', at: 'q2', dot: 'qR', other: 'qR' },
    q2: { alphanumeric: 'q3', at: 'qR', dot: 'qR', symbol: 'qR', other: 'qR' },
    q3: { alphanumeric: 'q3', dot: 'q4', symbol: 'q3', at: 'qR', other: 'qR' },
    q4: { alphanumeric: 'q4', dot: 'qR', at: 'qR', symbol: 'qR', other: 'qR' },
    qR: { alphanumeric: 'qR', at: 'qR', dot: 'qR', symbol: 'qR', other: 'qR' }
  }
};

export function classifySymbol(char) {
  if (/[a-zA-Z0-9]/.test(char)) return 'alphanumeric';
  if (char === '@') return 'at';
  if (char === '.') return 'dot';
  if (char === '_' || char === '-') return 'symbol';
  return 'other';
}

/**
 * Runs the DFA on an input string and produces an execution trace
 */
export function runDFA(inputString) {
  const str = String(inputString || '');
  let currentState = DFA_DEFINITION.initialState;
  const path = [];
  const statesVisited = [currentState];

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const symbolClass = classifySymbol(char);
    const stateTransitions = DFA_DEFINITION.transitions[currentState] || {};
    let nextState = stateTransitions[symbolClass] || stateTransitions['other'] || DFA_DEFINITION.deadState;

    path.push({
      step: i + 1,
      index: i,
      char,
      symbolClass,
      fromState: currentState,
      toState: nextState,
      isFinal: DFA_DEFINITION.finalStates.includes(nextState),
      isDead: nextState === DFA_DEFINITION.deadState
    });

    currentState = nextState;
    statesVisited.push(currentState);
  }

  const isAccepted = DFA_DEFINITION.finalStates.includes(currentState);

  return {
    input: str,
    accepted: isAccepted,
    finalState: currentState,
    statesVisited,
    path,
    stateInfo: DFA_DEFINITION.stateMetadata[currentState],
    evaluation: isAccepted 
      ? `Accepted: Halts in final state ${currentState} ∈ F. Valid credential format.`
      : `Rejected: Halts in state ${currentState} ∉ F. Format invalid.`
  };
}

/**
 * Formal Languages & Automata Theory (FLAT)
 * Transaction Modeling DFA M_trans = (Q, Σ, δ, q0, F)
 */
export const TRANSACTION_DFA_DEFINITION = {
  name: 'SecureBank Transaction State Machine DFA',
  states: ['INITIATED', 'APPROVED', 'REJECTED'],
  alphabet: ['VALID_TRANSACTION', 'INVALID_RECEIVER', 'INSUFFICIENT_BALANCE', 'DATABASE_FAILURE'],
  initialState: 'INITIATED',
  finalStates: ['APPROVED', 'REJECTED'],
  stateMetadata: {
    INITIATED: {
      id: 'INITIATED',
      label: 'INITIATED',
      sub: 'q₀ (Start)',
      name: 'Transaction Initiated',
      desc: 'User dispatches fund transfer payload via REST API over TCP/IP',
      x: 350,
      y: 70,
      color: 'blue',
      isInitial: true,
      isFinal: false,
      isDead: false
    },
    APPROVED: {
      id: 'APPROVED',
      label: 'APPROVED',
      sub: 'q_app ∈ F',
      name: 'Transfer Approved',
      desc: 'Valid transaction: Account verified, sufficient funds, ledger atomic commit confirmed',
      x: 180,
      y: 200,
      color: 'green',
      isInitial: false,
      isFinal: true,
      isDead: false
    },
    REJECTED: {
      id: 'REJECTED',
      label: 'REJECTED',
      sub: 'q_rej ∈ F',
      name: 'Transaction Rejected',
      desc: 'Terminal trap: Invalid receiver, insufficient balance, or database failure trapped',
      x: 520,
      y: 200,
      color: 'red',
      isInitial: false,
      isFinal: true,
      isDead: true
    },
    // Backward compatibility alias
    VALIDATING: {
      id: 'VALIDATING',
      label: 'VALIDATING',
      sub: 'Checking',
      name: 'Verification Gate',
      desc: 'Checking balance and account existence',
      x: 350,
      y: 130,
      color: 'cyan',
      isInitial: false,
      isFinal: false,
      isDead: false
    },
    COMPLETED: {
      id: 'APPROVED',
      label: 'APPROVED',
      sub: 'q_app ∈ F',
      name: 'Transfer Approved',
      desc: 'Atomic commit settled in ledger',
      x: 180,
      y: 200,
      color: 'green',
      isInitial: false,
      isFinal: true,
      isDead: false
    }
  },
  delta: {
    INITIATED: {
      VALID_TRANSACTION: 'APPROVED',
      INVALID_RECEIVER: 'REJECTED',
      INSUFFICIENT_BALANCE: 'REJECTED',
      DATABASE_FAILURE: 'REJECTED',
      DISPATCH_SUBMIT: 'VALIDATING',
      CHECK_PASS: 'APPROVED',
      CHECK_FAIL: 'REJECTED',
      COMMIT_PASS: 'APPROVED',
      COMMIT_FAIL: 'REJECTED'
    },
    APPROVED: {
      VALID_TRANSACTION: 'APPROVED',
      INVALID_RECEIVER: 'APPROVED',
      INSUFFICIENT_BALANCE: 'APPROVED',
      DATABASE_FAILURE: 'APPROVED',
      DISPATCH_SUBMIT: 'APPROVED',
      CHECK_PASS: 'APPROVED',
      CHECK_FAIL: 'APPROVED',
      COMMIT_PASS: 'APPROVED',
      COMMIT_FAIL: 'APPROVED'
    },
    REJECTED: {
      VALID_TRANSACTION: 'REJECTED',
      INVALID_RECEIVER: 'REJECTED',
      INSUFFICIENT_BALANCE: 'REJECTED',
      DATABASE_FAILURE: 'REJECTED',
      DISPATCH_SUBMIT: 'REJECTED',
      CHECK_PASS: 'REJECTED',
      CHECK_FAIL: 'REJECTED',
      COMMIT_PASS: 'REJECTED',
      COMMIT_FAIL: 'REJECTED'
    }
  }
};

export const TRANSACTION_FSM_STEPS = [
  { state: 'INITIATED', label: '1. INITIATED', desc: 'Transfer payload captured' },
  { state: 'APPROVED', label: '2. APPROVED', desc: 'Validation passed & settled' },
  { state: 'REJECTED', label: '2. REJECTED', desc: 'Validation failed & aborted' }
];

