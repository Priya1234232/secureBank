/**
 * Formal Languages and Automata Theory (FLAT)
 * Deterministic Finite Automaton (DFA) Core Engine
 * 
 * Mathematical Definition:
 * M = (Q, Σ, δ, q0, F)
 * Where:
 *  - Q: Finite set of states
 *  - Σ: Input alphabet
 *  - δ: Transition function δ: Q × Σ → Q
 *  - q0: Initial state (q0 ∈ Q)
 *  - F: Set of accepting/final states (F ⊆ Q)
 */

class DFAEngine {
  constructor(definition) {
    this.name = definition.name || 'DFA Validator';
    this.description = definition.description || '';
    this.states = definition.states; // Q
    this.alphabet = definition.alphabet; // Σ
    this.transitions = definition.transitions; // δ: { state: { symbolClass: nextState } }
    this.initialState = definition.initialState; // q0
    this.finalStates = new Set(definition.finalStates); // F
    this.deadState = definition.deadState || 'qR';
    this.symbolClassifier = definition.symbolClassifier || this.defaultClassifier;
  }

  defaultClassifier(char) {
    if (/[a-zA-Z0-9]/.test(char)) return 'alphanumeric';
    if (char === '@') return 'at';
    if (char === '.') return 'dot';
    if (char === '_' || char === '-') return 'symbol';
    return 'other';
  }

  /**
   * Executes the DFA step-by-step on an input string
   * @param {string} inputString 
   * @returns {Object} Full execution trace and acceptance status
   */
  run(inputString) {
    const str = String(inputString || '');
    let currentState = this.initialState;
    const path = [];
    const statesVisited = [currentState];

    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      const symbolClass = this.symbolClassifier(char);
      const stateTransitions = this.transitions[currentState] || {};
      
      // Determine next state using transition function δ(q, σ)
      let nextState = stateTransitions[symbolClass];

      // If no explicit transition is defined, transition to the dead/rejected sink state
      if (!nextState) {
        nextState = stateTransitions['other'] || this.deadState;
      }

      path.push({
        step: i + 1,
        index: i,
        char: char,
        symbolClass: symbolClass,
        fromState: currentState,
        toState: nextState,
        isAccepted: this.finalStates.has(nextState),
        isDead: nextState === this.deadState
      });

      currentState = nextState;
      statesVisited.push(currentState);
    }

    const accepted = this.finalStates.has(currentState);

    return {
      name: this.name,
      input: str,
      accepted,
      finalState: currentState,
      statesVisited,
      path,
      formalTuple: {
        Q: this.states,
        Sigma: this.alphabet,
        q0: this.initialState,
        F: Array.from(this.finalStates),
        deadState: this.deadState
      },
      evaluation: accepted 
        ? `Accepted: String "${str}" successfully halts in final state ${currentState} ∈ F.`
        : `Rejected: String "${str}" halts in non-accepting state ${currentState} ∉ F.`
    };
  }

  /**
   * Returns a structured 2D transition table representation
   */
  getTransitionTable() {
    const table = [];
    for (const state of this.states) {
      const row = {
        state,
        isInitial: state === this.initialState,
        isFinal: this.finalStates.has(state),
        isDead: state === this.deadState,
        transitions: {}
      };
      for (const symbol of this.alphabet) {
        const target = (this.transitions[state] && this.transitions[state][symbol]) || this.deadState;
        row.transitions[symbol] = target;
      }
      table.push(row);
    }
    return table;
  }
}

module.exports = DFAEngine;
