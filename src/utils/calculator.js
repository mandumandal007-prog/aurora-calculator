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

const OPERATOR_FROM_SYMBOL = {
  '+': '+',
  '−': '-',
  '-': '-',
  '×': '*',
  '*': '*',
  '÷': '/',
  '/': '/',
};

const MAX_DIGITS = 16;
const HISTORY_LIMIT = 50;

export const initialState = {
  display: '0',
  previous: null,
  operator: null,
  overwrite: true,
  expression: '',
  angleMode: 'DEG',
  history: [],
};

const toRadians = (x, mode) => (mode === 'DEG' ? (x * Math.PI) / 180 : x);

// Clean tiny floating point noise from trig results (e.g. sin(180°)).
const snap = (x) => (Math.abs(x) < 1e-12 ? 0 : x);

export const UNARY_FNS = {
  sin: (x, mode) => snap(Math.sin(toRadians(x, mode))),
  cos: (x, mode) => snap(Math.cos(toRadians(x, mode))),
  tan: (x, mode) => {
    const c = snap(Math.cos(toRadians(x, mode)));
    if (c === 0) return NaN;
    return snap(Math.tan(toRadians(x, mode)));
  },
  log: (x) => Math.log10(x),
  ln: (x) => Math.log(x),
  '√': (x) => Math.sqrt(x),
  'x²': (x) => x * x,
};

export const UNARY_LABELS = {
  sin: (v) => `sin(${v})`,
  cos: (v) => `cos(${v})`,
  tan: (v) => `tan(${v})`,
  log: (v) => `log(${v})`,
  ln: (v) => `ln(${v})`,
  '√': (v) => `√(${v})`,
  'x²': (v) => `(${v})²`,
};

export const CONSTANTS = {
  'π': Math.PI,
  e: Math.E,
};

/** Format a number for the display string. */
export function formatNumber(value) {
  if (typeof value !== 'number' || !isFinite(value)) return 'Error';
  if (Object.is(value, -0)) value = 0;
  const abs = Math.abs(value);
  if (abs !== 0 && (abs >= 1e16 || abs < 1e-9)) {
    return value.toExponential(8).replace(/\.?0+e/, 'e');
  }
  const rounded = parseFloat(value.toPrecision(14));
  return String(rounded);
}

/** Prettify a display string with thousands separators (UI only). */
export function prettify(display) {
  if (display === 'Error' || display.includes('e')) return display;
  const negative = display.startsWith('-');
  const body = negative ? display.slice(1) : display;
  const [intPart, decPart] = body.split('.');
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return (negative ? '-' : '') + withCommas + (decPart !== undefined ? '.' + decPart : '');
}

export function compute(a, b, op) {
  switch (op) {
    case '+':
      return a + b;
    case '-':
      return a - b;
    case '*':
      return a * b;
    case '/':
      return b === 0 ? NaN : a / b;
    default:
      return b;
  }
}

const isError = (state) => state.display === 'Error';

export function calculatorReducer(state, action) {
  switch (action.type) {
    case 'DIGIT': {
      const d = String(action.payload);
      if (isError(state) || state.overwrite) {
        return { ...state, display: d, overwrite: false };
      }
      if (state.display.replace(/[-.]/g, '').length >= MAX_DIGITS) return state;
      if (state.display === '0') return { ...state, display: d };
      if (state.display === '-0') return { ...state, display: '-' + d };
      return { ...state, display: state.display + d };
    }

    case 'DECIMAL': {
      if (isError(state) || state.overwrite) {
        return { ...state, display: '0.', overwrite: false };
      }
      if (state.display.includes('.')) return state;
      return { ...state, display: state.display + '.' };
    }

    case 'BACKSPACE': {
      if (isError(state) || state.overwrite) {
        return { ...state, display: '0', overwrite: true };
      }
      const next = state.display.slice(0, -1);
      if (next === '' || next === '-') {
        return { ...state, display: '0', overwrite: true };
      }
      return { ...state, display: next };
    }

    case 'TOGGLE_SIGN': {
      if (isError(state)) return state;
      if (state.display === '0') return state;
      const display = state.display.startsWith('-')
        ? state.display.slice(1)
        : '-' + state.display;
      return { ...state, display };
    }

    case 'PERCENT': {
      if (isError(state)) return state;
      const current = parseFloat(state.display);
      let value = current / 100;
      // 200 + 10% -> 200 + 20 (percentage of the left operand)
      if (state.previous !== null && (state.operator === '+' || state.operator === '-')) {
        value = (state.previous * current) / 100;
      }
      return { ...state, display: formatNumber(value), overwrite: true };
    }

    case 'OPERATOR': {
      if (isError(state)) return state;
      const op = OPERATOR_FROM_SYMBOL[action.payload] || action.payload;
      const current = parseFloat(state.display);

      // Changing the operator before typing the next number.
      if (state.operator && state.overwrite && state.previous !== null) {
        return {
          ...state,
          operator: op,
          expression: `${formatNumber(state.previous)} ${OPERATOR_SYMBOLS[op]}`,
        };
      }

      let base = current;
      if (state.previous !== null && state.operator) {
        base = compute(state.previous, current, state.operator);
      }
      const shown = formatNumber(base);
      if (shown === 'Error') {
        return { ...state, display: 'Error', previous: null, operator: null, overwrite: true, expression: '' };
      }
      return {
        ...state,
        display: shown,
        previous: base,
        operator: op,
        overwrite: true,
        expression: `${shown} ${OPERATOR_SYMBOLS[op]}`,
      };
    }

    case 'EQUALS': {
      if (isError(state)) return state;
      if (state.previous === null || !state.operator) return state;
      const current = parseFloat(state.display);
      const result = compute(state.previous, current, state.operator);
      const shown = formatNumber(result);
      const expression = `${formatNumber(state.previous)} ${OPERATOR_SYMBOLS[state.operator]} ${formatNumber(current)}`;
      const history =
        shown === 'Error'
          ? state.history
          : [{ id: `${Date.now()}-${Math.random()}`, expression, result: shown }, ...state.history].slice(0, HISTORY_LIMIT);
      return {
        ...state,
        display: shown,
        previous: null,
        operator: null,
        overwrite: true,
        expression: `${expression} =`,
        history,
      };
    }

    case 'UNARY': {
      if (isError(state)) return state;
      const fn = UNARY_FNS[action.payload];
      if (!fn) return state;
      const current = parseFloat(state.display);
      const result = fn(current, state.angleMode);
      const shown = formatNumber(result);
      const label = UNARY_LABELS[action.payload](formatNumber(current));
      const history =
        shown === 'Error'
          ? state.history
          : [{ id: `${Date.now()}-${Math.random()}`, expression: label, result: shown }, ...state.history].slice(0, HISTORY_LIMIT);
      return {
        ...state,
        display: shown,
        overwrite: true,
        expression: `${label} =`,
        history,
      };
    }

    case 'CONSTANT': {
      const value = CONSTANTS[action.payload];
      if (value === undefined) return state;
      return { ...state, display: formatNumber(value), overwrite: true };
    }

    case 'TOGGLE_ANGLE':
      return { ...state, angleMode: state.angleMode === 'DEG' ? 'RAD' : 'DEG' };

    case 'LOAD_RESULT': {
      // Reopen a history entry: put its result on the display.
      return { ...state, display: String(action.payload), overwrite: true, expression: '' };
    }

    case 'CLEAR_HISTORY':
      return { ...state, history: [] };

    case 'CLEAR':
      return { ...initialState, angleMode: state.angleMode, history: state.history };

    default:
      return state;
  }
}

export default calculatorReducer;
