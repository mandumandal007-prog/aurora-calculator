import React, { useCallback, useMemo, useReducer, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CalcButton from '../components/CalcButton';
import { calculatorReducer, initialState } from '../utils/calculator';
import { useTheme } from '../context/ThemeContext';

const BASIC_LAYOUT = [
  ['AC', '⌫', '%', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '−'],
  ['1', '2', '3', '+'],
  ['±', '0', '.', '='],
];

const SCI_LAYOUT = [
  ['sin', 'cos', 'tan', 'π'],
  ['log', 'ln', '√', 'x²'],
];

const SCIENTIFIC_KEYS = ['sin', 'cos', 'tan', 'log', 'ln', '√', 'x²', 'π'];
const OPERATOR_KEYS = ['÷', '×', '−', '+'];
const FUNCTION_KEYS = ['⌫', '%', '±', '.'];

function getButtonType(label) {
  if (label === '=') return 'equals';
  if (label === 'AC') return 'danger';
  if (OPERATOR_KEYS.includes(label)) return 'operator';
  if (FUNCTION_KEYS.includes(label)) return 'function';
  if (SCIENTIFIC_KEYS.includes(label)) return 'scientific';
  return 'number';
}

function makeStyles(colors) {
  return StyleSheet.create({
    safe
