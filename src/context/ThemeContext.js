import React, { createContext, useContext, useState, useMemo } from 'react';
import { themes } from '../theme';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState('dark');

  const value = useMemo(
    () => ({
      mode,
      colors: themes[mode],
      toggle: () => setMode((m) => (m === 'dark' ? 'light' : 'dark')),
    }),
    [mode]
  );

  return <Theme
