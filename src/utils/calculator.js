/**
 * Aurora Calculator — calculation engine.
 *
 * Framework-free reducer + pure helpers. Everything is testable in isolation.
 * The reducer owns the full calculator state, including the history list.
 */

export const OPERATOR_SYMBOLS = {
  '+': '+',
  '-': '−',
  '*': '×',
  '/': '÷',
};

const OPERATOR
