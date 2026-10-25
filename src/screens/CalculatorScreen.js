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
import { LinearGradient } from 'expo-linear-gradient';

import CalcButton from '../components/CalcButton';
import { calculatorReducer, initialState, prettify } from '../utils/calculator';
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
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      paddingHorizontal: 12,
      paddingBottom: 8,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 6,
      paddingTop: 8,
      paddingBottom: 4,
    },
    title: {
      color: colors.text,
      fontSize: 20,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    chip: {
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 14,
      backgroundColor: colors.surfaceAlt,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      marginLeft: 8,
    },
    chipActive: {
      backgroundColor: colors.accent,
    },
    chipText: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '600',
    },
    chipTextActive: {
      color: '#FFFFFF',
    },
    displayCard: {
      flex: 1,
      justifyContent: 'flex-end',
      paddingHorizontal: 14,
      paddingVertical: 12,
      marginTop: 6,
      marginBottom: 10,
      marginHorizontal: 6,
      borderRadius: 26,
      backgroundColor: colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      minHeight: 140,
    },
    angleBadge: {
      position: 'absolute',
      top: 12,
      left: 14,
      color: colors.textMuted,
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 1,
    },
    expression: {
      color: colors.textMuted,
      fontSize: 20,
      textAlign: 'right',
      marginBottom: 4,
    },
    display: {
      color: colors.text,
      fontSize: 64,
      fontWeight: '300',
      textAlign: 'right',
    },
    keypad: {
      flex: 0,
    },
    sciPad: {
      marginBottom: 4,
    },
    row: {
      flexDirection: 'row',
    },
    basicRow: {
      height: 78,
    },
    sciRow: {
      height: 52,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: colors.modalOverlay,
      justifyContent: 'flex-end',
    },
    modalSheet: {
      maxHeight: '75%',
      backgroundColor: colors.surface,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingTop: 10,
      paddingHorizontal: 18,
      paddingBottom: 24,
    },
    sheetHandle: {
      alignSelf: 'center',
      width: 44,
      height: 5,
      borderRadius: 3,
      backgroundColor: colors.border,
      marginBottom: 12,
    },
    sheetHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    sheetTitle: {
      color: colors.text,
      fontSize: 20,
      fontWeight: '700',
    },
    sheetAction: {
      color: colors.accent,
      fontSize: 15,
      fontWeight: '600',
      paddingVertical: 6,
      paddingHorizontal: 4,
    },
    historyItem: {
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    historyExpr: {
      color: colors.textMuted,
      fontSize: 15,
      textAlign: 'right',
    },
    historyResult: {
      color: colors.text,
      fontSize: 24,
      fontWeight: '500',
      textAlign: 'right',
      marginTop: 2,
    },
    emptyText: {
      color: colors.textMuted,
      fontSize: 15,
      textAlign: 'center',
      paddingVertical: 36,
    },
  });
}

export default function CalculatorScreen() {
  const { colors, mode, toggle } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [state, dispatch] = useReducer(calculatorReducer, initialState);
  const [scientific, setScientific] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const handlePress = useCallback((label) => {
    if (/^[0-9]$/.test(label)) return dispatch({ type: 'DIGIT', payload: label });
    switch (label) {
      case '.':
        return dispatch({ type: 'DECIMAL' });
      case '⌫':
        return dispatch({ type: 'BACKSPACE' });
      case '±':
        return dispatch({ type: 'TOGGLE_SIGN' });
      case '%':
        return dispatch({ type: 'PERCENT' });
      case '=':
        return dispatch({ type: 'EQUALS' });
      case 'AC':
        return dispatch({ type: 'CLEAR' });
      case 'π':
        return dispatch({ type: 'CONSTANT', payload: 'π' });
      case '÷':
      case '×':
      case '−':
      case '+':
        return dispatch({ type: 'OPERATOR', payload: label });
      default:
        if (SCIENTIFIC_KEYS.includes(label)) {
          return dispatch({ type: 'UNARY', payload: label });
        }
        return undefined;
    }
  }, []);

  const displayText = prettify(state.display);
  const displaySize = displayText.length > 12 ? 40 : displayText.length > 9 ? 52 : 64;

  return (
    <LinearGradient colors={colors.backgroundGradient} style={{ flex: 1 }}>
      <SafeAreaView style={[styles.safe, { backgroundColor: 'transparent' }]} edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Aurora</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={[styles.chip, scientific && styles.chipActive]}
                onPress={() => setScientific((s) => !s)}
              >
                <Text style={[styles.chipText, scientific && styles.chipTextActive]}>SCI</Text>
              </TouchableOpacity>
              {scientific && (
                <TouchableOpacity style={styles.chip} onPress={() => dispatch({ type: 'TOGGLE_ANGLE' })}>
                  <Text style={styles.chipText}>{state.angleMode}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.chip} onPress={() => setHistoryOpen(true)}>
                <Text style={styles.chipText}>History</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.chip} onPress={toggle}>
                <Text style={styles.chipText}>{mode === 'dark' ? '☀︎' : '☾'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.displayCard}>
            {scientific && <Text style={styles.angleBadge}>{state.angleMode}</Text>}
            <Text style={styles.expression} numberOfLines={1} adjustsFontSizeToFit>
              {state.expression || ' '}
            </Text>
            <Text
              style={[styles.display, { fontSize: displaySize }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {displayText}
            </Text>
          </View>

          <View style={styles.keypad}>
            {scientific && (
              <View style={styles.sciPad}>
                {SCI_LAYOUT.map((row, i) => (
                  <View key={`sci-${i}`} style={[styles.row, styles.sciRow]}>
                    {row.map((label) => (
                      <CalcButton
                        key={label}
                        label={label}
                        type={getButtonType(label)}
                        onPress={handlePress}
                        compact
                      />
                    ))}
                  </View>
                ))}
              </View>
            )}
            {BASIC_LAYOUT.map((row, i) => (
              <View key={`row-${i}`} style={[styles.row, styles.basicRow]}>
                {row.map((label) => (
                  <CalcButton
                    key={label}
                    label={label}
                    type={getButtonType(label)}
                    onPress={handlePress}
                  />
                ))}
              </View>
            ))}
          </View>
        </View>

        <Modal
          visible={historyOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setHistoryOpen(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setHistoryOpen(false)}
          >
            <TouchableOpacity activeOpacity={1} style={styles.modalSheet}>
              <View style={styles.sheetHandle} />
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>History</Text>
                <View style={styles.headerActions}>
                  {state.history.length > 0 && (
                    <TouchableOpacity onPress={() => dispatch({ type: 'CLEAR_HISTORY' })}>
                      <Text style={[styles.sheetAction, { marginRight: 14 }]}>Clear</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => setHistoryOpen(false)}>
                    <Text style={styles.sheetAction}>Done</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <ScrollView>
                {state.history.length === 0 ? (
                  <Text style={styles.emptyText}>No calculations yet</Text>
                ) : (
                  state.history.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.historyItem}
                      onPress={() => {
                        dispatch({ type: 'LOAD_RESULT', payload: item.result });
                        setHistoryOpen(false);
                      }}
                    >
                      <Text style={styles.historyExpr}>{item.expression}</Text>
                      <Text style={styles.historyResult}>= {prettify(item.result)}</Text>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}
