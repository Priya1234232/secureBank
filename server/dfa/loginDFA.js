/**
 * Login Identifier & Credential DFA
 * Model: M = (Q, Σ, δ, q0, F)
 * 
 * Formal Definition:
 *  - Q = { q0, q1, q2, q3, q4, qR }
 *  - Σ = { alphanumeric, at, dot, symbol, other }
 *  - q0 = 'q0' (Initial State)
 *  - F = { 'q4' } (Accepted State: complete valid banking identifier format)
 *  - qR = 'qR' (Trap / Rejection state)
 */

const DFAEngine = require('./engine');

const loginDFADefinition = {
  name: 'SecureBank Login Credential DFA',
  description: 'Deterministic Finite Automaton validating banking identifier format: <username>@<domain>.<tld>',
  states: ['q0', 'q1', 'q2', 'q3', 'q4', 'qR'],
  alphabet: ['alphanumeric', 'at', 'dot', 'symbol', 'other'],
  initialState: 'q0',
  finalStates: ['q4'],
  deadState: 'qR',
  
  // State descriptions for educational visualization
  stateMetadata: {
    q0: { label: 'q0: Initial State', description: 'Start state, waiting for user identifier prefix', isInitial: true, isFinal: false },
    q1: { label: 'q1: Valid Identifier', description: 'Consuming alphanumeric identifier / username', isInitial: false, isFinal: false },
    q2: { label: 'q2: Separator Detected', description: 'Detected "@" delimiter symbol', isInitial: false, isFinal: false },
    q3: { label: 'q3: Credential Realm', description: 'Consuming banking domain / realm', isInitial: false, isFinal: false },
    q4: { label: 'q4: Accepted State', description: 'Valid format verified and accepted into banking gate', isInitial: false, isFinal: true },
    qR: { label: 'qR: Rejected State', description: 'Trap state: invalid character or syntax violation', isInitial: false, isFinal: false, isDead: true }
  },

  symbolClassifier: (char) => {
    if (/[a-zA-Z0-9]/.test(char)) return 'alphanumeric';
    if (char === '@') return 'at';
    if (char === '.') return 'dot';
    if (char === '_' || char === '-') return 'symbol';
    return 'other';
  },

  // Transition function δ: Q × Σ → Q
  transitions: {
    q0: {
      alphanumeric: 'q1',
      at: 'qR',
      dot: 'qR',
      symbol: 'qR',
      other: 'qR'
    },
    q1: {
      alphanumeric: 'q1',
      symbol: 'q1',
      at: 'q2',
      dot: 'qR',
      other: 'qR'
    },
    q2: {
      alphanumeric: 'q3',
      at: 'qR',
      dot: 'qR',
      symbol: 'qR',
      other: 'qR'
    },
    q3: {
      alphanumeric: 'q3',
      dot: 'q4',
      at: 'qR',
      symbol: 'q3',
      other: 'qR'
    },
    q4: {
      alphanumeric: 'q4',
      dot: 'qR',
      at: 'qR',
      symbol: 'qR',
      other: 'qR'
    },
    qR: {
      alphanumeric: 'qR',
      at: 'qR',
      dot: 'qR',
      symbol: 'qR',
      other: 'qR'
    }
  }
};

const loginDFA = new DFAEngine(loginDFADefinition);
loginDFA.stateMetadata = loginDFADefinition.stateMetadata;

module.exports = {
  loginDFA,
  loginDFADefinition
};
