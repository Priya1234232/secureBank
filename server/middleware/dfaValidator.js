const { loginDFA } = require('../dfa/loginDFA');

/**
 * FLAT DFA Validation Middleware
 * Enforces formal language syntax for user identifiers before reaching cryptographic authentication.
 */
const validateIdentifierDFA = (req, res, next) => {
  const identifier = req.body.email || req.body.identifier;

  if (!identifier) {
    return res.status(400).json({
      success: false,
      message: 'Identifier/Email is required for authentication'
    });
  }

  // Execute DFA
  const dfaResult = loginDFA.run(identifier);

  // If DFA rejects string
  if (!dfaResult.accepted) {
    return res.status(422).json({
      success: false,
      message: 'FLAT DFA Validation Failed: Input does not conform to permitted language grammar L(M)',
      dfaEvaluation: dfaResult.evaluation,
      dfaTrace: dfaResult,
      explanation: 'According to Formal Languages and Automata Theory, input string was rejected by the Deterministic Finite Automaton before cryptographic password verification.'
    });
  }

  // Attach DFA result to request context
  req.dfaValidation = dfaResult;
  next();
};

module.exports = {
  validateIdentifierDFA
};
