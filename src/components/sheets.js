import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import BottomSheet from './BottomSheet';
import { useConfirm } from '../contexts/DialogContext';
import { Button, Touchable } from './ui';
import { WasteIcon } from './coleta';
import { WASTE_ORDER, WASTE_TYPES, colors, fonts, radius, type, wasteFromValue } from '../theme';
import { formatLitros, formatRelative, litros } from '../utils/format';

export function NovaColetaSheet({ visible, onClose, onSelect }) {
  return (
    <BottomSheet visible={visible} onClose={onClose} accessibilityLabel="Nova coleta">
      <Text style={type.h2} accessibilityRole="header">
        Nova coleta
      </Text>
      <Text style={[type.caption, { marginTop: 4, marginBottom: 16 }]}>Qual tipo de resíduo você vai registrar?</Text>
      {WASTE_ORDER.map((k) => {
        const t = WASTE_TYPES[k];
        return (
          <Touchable
            key={k}
            onPress={() => onSelect(k)}
            style={styles.option}
            accessibilityRole="button"
            accessibilityLabel={`${t.longLabel}: ${t.hint}`}
          >
            <WasteIcon type={t} size={48} />
            <View style={{ flex: 1 }}>
              <Text style={type.bodyStrong}>{t.longLabel}</Text>
              <Text style={type.caption}>{t.hint}</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.chevron} />
          </Touchable>
        );
      })}
      <Button title="Cancelar" variant="ghost" onPress={onClose} />
    </BottomSheet>
  );
}

export function ColetaDetailSheet({ coleta, onClose, onEdit, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  const confirm = useConfirm();
  if (!coleta) return <BottomSheet visible={false} onClose={onClose} />;
  const t = wasteFromValue(coleta.TipoResiduo);

  const confirmDelete = async () => {
    const ok = await confirm({
      title: 'Excluir coleta?',
      message: `${t.longLabel} de ${formatLitros(litros(coleta))}, ${formatRelative(coleta.DataRegistro).toLowerCase()}. Essa ação não pode ser desfeita.`,
      confirmLabel: 'Excluir',
      destructive: true,
    });
    if (!ok) return;
    setDeleting(true);
    try {
      await onDelete(coleta);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <BottomSheet visible={!!coleta} onClose={onClose} accessibilityLabel="Detalhe da coleta">
      <View style={styles.head}>
        <WasteIcon type={t} size={52} />
        <View style={{ flex: 1 }}>
          <Text style={type.title}>{t.longLabel}</Text>
          <Text style={type.caption}>{formatRelative(coleta.DataRegistro).replace(',', ' às')}</Text>
        </View>
      </View>
      <View style={styles.stats}>
        <Stat label="Saco" value={`${coleta.TamanhoSaco} L`} />
        <Stat label="Sacos" value={String(coleta.Quantidade)} />
        <Stat label="Total" value={formatLitros(litros(coleta))} />
      </View>
      <KeyValue label="Registrado por" value={coleta.NomeColaborador || '—'} />
      <KeyValue label="Observações" value={coleta.Observacoes || 'Nenhuma'} last />
      <View style={styles.actions}>
        <Button title="Excluir" icon="trash-2" variant="danger" onPress={confirmDelete} loading={deleting} style={{ flex: 1 }} accessibilityLabel="Excluir coleta" />
        <Button title="Editar" icon="edit-2" onPress={() => onEdit(coleta)} style={{ flex: 1 }} accessibilityLabel="Editar coleta" />
      </View>
    </BottomSheet>
  );
}

const Stat = ({ label, value }) => (
  <View style={styles.stat}>
    <Text style={type.small}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

const KeyValue = ({ label, value, last }) => (
  <View style={[styles.kv, last && { borderBottomWidth: 0 }]}>
    <Text style={type.caption}>{label}</Text>
    <Text style={[type.bodyStrong, { flexShrink: 1, textAlign: 'right' }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: radius.xl,
    marginBottom: 10,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stats: { flexDirection: 'row', gap: 8, marginTop: 16, marginBottom: 8 },
  stat: { flex: 1, backgroundColor: colors.mist, borderRadius: radius.md, padding: 10 },
  statValue: { fontFamily: fonts.extrabold, fontSize: 18, color: colors.ink, marginTop: 2 },
  kv: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, minHeight: 48, borderBottomWidth: 1, borderBottomColor: colors.divider },
  actions: { flexDirection: 'row', gap: 10, marginTop: 16 },
});
