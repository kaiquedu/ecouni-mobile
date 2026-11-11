import React, { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BAG_SIZES, WASTE_ORDER, WASTE_TYPES, colors, fonts } from '../theme';
import { ChoiceGrid, Label, Segmented, SelectField, Stepper, TextField } from './ui';
import { formatDate, formatLitros, formatRelative, formatTime } from '../utils/format';

export function ColetaFields({ value, onChange, showTypeSelector = false, bagOptions = BAG_SIZES }) {
  const [picker, setPicker] = useState(null);
  const set = (patch) => onChange({ ...value, ...patch });

  const onPick = (event, selected) => {
    const mode = picker;
    setPicker(Platform.OS === 'ios' ? picker : null);
    if (event.type === 'dismissed' || !selected) return;
    const base = new Date(value.data);
    if (mode === 'date') {
      base.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
      set({ data: base });
      if (Platform.OS === 'android') setTimeout(() => setPicker('time'), 50);
    } else {
      base.setHours(selected.getHours(), selected.getMinutes());
      set({ data: base });
    }
  };

  return (
    <View>
      {showTypeSelector ? (
        <>
          <Label>Tipo de resíduo</Label>
          <Segmented
            options={WASTE_ORDER.map((k) => ({ value: k, label: WASTE_TYPES[k].label }))}
            value={value.tipo}
            onChange={(tipo) => set({ tipo })}
            renderOption={(opt, sel) => {
              const t = WASTE_TYPES[opt.value];
              return (
                <View style={styles.typeOpt}>
                  <MaterialCommunityIcons name={t.icon} size={20} color={sel ? t.color : colors.muted} />
                  <Text style={[styles.typeText, sel && { color: colors.ink }]} numberOfLines={1}>
                    {t.label}
                  </Text>
                </View>
              );
            }}
          />
        </>
      ) : null}

      <Label>Tamanho do saco</Label>
      <ChoiceGrid
        options={bagOptions}
        value={value.saco}
        onChange={(saco) => set({ saco })}
        format={(v) => `${v} L`}
        accessibilityLabel="Tamanho do saco"
      />

      <Label>Quantidade de sacos</Label>
      <Stepper value={value.quantidade} onChange={(quantidade) => set({ quantidade })} label="Quantidade de sacos" />

      <SelectField
        label="Data e hora"
        icon="calendar"
        value={formatRelative(value.data)}
        onPress={() => setPicker('date')}
        accessibilityLabel={`Data e hora: ${formatDate(value.data)} às ${formatTime(value.data)}. Toque para alterar`}
      />
      {picker ? (
        <DateTimePicker
          value={value.data}
          mode={picker}
          is24Hour
          maximumDate={picker === 'date' ? new Date() : undefined}
          onChange={onPick}
        />
      ) : null}

      <TextField
        label="Observações"
        optional="opcional"
        placeholder="Ex.: coletado no bloco B"
        value={value.observacoes}
        onChangeText={(observacoes) => set({ observacoes })}
        maxLength={500}
        returnKeyType="done"
        enterKeyHint="done"
      />
    </View>
  );
}

export const totalOf = (value) => (value.saco || 0) * (value.quantidade || 0);

export function TotalBar({ value, children }) {
  return (
    <View style={styles.totalBar}>
      <View>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>{value.saco ? formatLitros(totalOf(value)) : '—'}</Text>
      </View>
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  typeOpt: { alignItems: 'center', gap: 2, paddingVertical: 6 },
  typeText: { fontFamily: fonts.bold, fontSize: 12, color: colors.muted },
  totalBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    backgroundColor: colors.white,
  },
  totalLabel: { fontFamily: fonts.medium, fontSize: 13, color: colors.muted },
  totalValue: { fontFamily: fonts.extrabold, fontSize: 20, color: colors.ink },
});
