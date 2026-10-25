# Aurora Calculator

A modern, colorful React Native calculator built with **Expo**.

Designed for phones and tablets, with a dark/light theme, scientific mode,
degrees/radians toggle, haptic feedback, and a persistent history panel.

## Features

- **Basic arithmetic** — addition, subtraction, multiplication, division, percent
- **Scientific mode** — sin, cos, tan, log, ln, square root, square, π
- **DEG / RAD toggle** for trigonometric functions
- **Dark & light themes** — instant switch from the header
- **History panel** — last 50 calculations, reopen
```

aurora-calculator/
├── App.js                          # Root: SafeAreaProvider + ThemeProvider
├── app.json                        # Expo config
├── babel.config.js
├── package.json
└── src/
├── context/
│   └── ThemeContext.js         # Dark/light theme provider
├── theme/
│   └── index.js                # Color palettes
├── utils/
│   └── calculator.js           # Pure reducer + math helpers
├── components/
│   └── CalcButton.js           # Themed, haptic-enabled key
└── screens/
└── CalculatorScreen.js     # Main UI + history modal

```

## Getting started

### 1. Install dependencies

```bash
cd aurora-calculator
npm install
```

### 2. Run the app

```
npx expo start
```

Then:

- Press `a` to open on a connected Android device or emulator
- Press `i` to open on the iOS simulator (macOS only)
- Press `w` to open in the browser
- Or scan the QR code with the **Expo Go** app on your phone

> If a dependency version mismatch warning appears, run
> `npx expo install --fix` to sync versions.

### 3. Build a standalone app (optional)

```
npx expo run:android
```

Or use [EAS Build](https://docs.expo.dev/build/introduction/) for cloud builds.

## How the calculator state works

The whole calculator is one reducer (`src/utils/calculator.js`):

```
{
  display:     '0',      // current number as a string
  previous:    null,     // stored left-hand operand
  operator:    null,     // '+', '-', '*', '/'
  overwrite:   true,     // next digit replaces display?
  expression:  '',       // small text above the result
  angleMode:   'DEG',    // 'DEG' or 'RAD'
  history:     []        // last 50 { id, expression, result }
}
```

Actions dispatched by the UI: `DIGIT`, `DECIMAL`, `BACKSPACE`, `TOGGLE_SIGN`,
`PERCENT`, `OPERATOR`, `EQUALS`, `UNARY`, `CONSTANT`, `TOGGLE_ANGLE`, `CLEAR`.

Because it's a pure function, the engine can be unit-tested without any React
renderer — just feed it states and actions.

## Customising

- **Colors** — edit `src/theme/index.js`. Both palettes share the same keys.
- **Extra scientific keys** — add to `SCIENTIFIC_KEYS` and `SCI_LAYOUT` in
`CalculatorScreen.js`, plus a matching entry in `UNARY_FNS` in
`src/utils/calculator.js`.
- **History limit** — change `.slice(0, 50)` in the `EQUALS` handler.

## License

MIT — do whatever you like with it.

