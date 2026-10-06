import React, { useRef } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Colors, Radius, Typography } from '../theme';

interface Props {
  value: string[];
  onChange: (val: string[]) => void;
  hasError?: boolean;
}

export default function OTPInput({ value, onChange, hasError }: Props) {
  const refs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  const handleChange = (text: string, index: number) => {
    const cleaned = text.replace(/\D/g, '').slice(-1);
    const next = [...value];
    next[index] = cleaned;
    onChange(next);
    if (cleaned && index < 3) refs[index + 1].current?.focus();
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !value[index] && index > 0) {
      refs[index - 1].current?.focus();
    }
  };

  return (
    <View style={styles.row}>
      {[0, 1, 2, 3].map(i => (
        <TextInput
          key={i}
          ref={refs[i]}
          style={[
            styles.box,
            hasError && styles.boxError,
            value[i] ? styles.boxFilled : {},
          ]}
          value={value[i] || ''}
          onChangeText={t => handleChange(t, i)}
          onKeyPress={e => handleKeyPress(e, i)}
          keyboardType="number-pad"
          maxLength={1}
          selectTextOnFocus
          textAlign="center"
          returnKeyType={i < 3 ? 'next' : 'done'}
          aria-label={`OTP digit ${i + 1}`}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, justifyContent: 'center' },
  box: {
    width: 64, height: 72, backgroundColor: '#FFFFFF',
    borderRadius: Radius.DEFAULT, borderWidth: 2, borderColor: '#D1D5DB',
    ...Typography.displayLg, color: '#111827', textAlign: 'center',
    // Shadow for depth
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 2, elevation: 2,
  },
  boxFilled: { borderColor: '#3b82f6', backgroundColor: '#EFF6FF' },
  boxError: { borderColor: Colors.error, backgroundColor: '#FEF2F2' },
});
