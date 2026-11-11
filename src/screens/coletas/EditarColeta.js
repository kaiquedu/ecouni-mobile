import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useConfirm } from '../../contexts/DialogContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, TopBar } from '../../components/ui';
import { ColetaFields } from '../../components/ColetaForm';
import { useColetas } from '../../contexts/ColetasContext';
import { useToast } from '../../contexts/ToastContext';
import { BAG_SIZES, WASTE_TYPES, colors, wasteFromValue } from '../../theme';
import { formatLitros, litros, parseDate } from '../../utils/format';
import { toLocalIso } from './RegistrarColeta';

export default function EditarColeta({ navigation, route }) {
  const coleta = route.params.coleta;
  const { update, remove } = useColetas();
  const toast = useToast();
  const confirm = useConfirm();
  const [form, setForm] = useState({
    tipo: wasteFromValue(coleta.TipoResiduo).key,
    saco: coleta.TamanhoSaco,
    quantidade: coleta.Quantidade,
    data: parseDate(coleta.DataRegistro),
    observacoes: coleta.Observacoes || '',
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const save = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await update(coleta, {
        TipoResiduo: WASTE_TYPES[form.tipo].value,
        TamanhoSaco: form.saco,
        Quantidade: form.quantidade,
        Observacoes: form.observacoes,
        DataRegistro: toLocalIso(form.data),
      });
      toast('Alterações salvas.');
      navigation.goBack();
    } catch (e) {
      toast(e.message, 'error');
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    const ok = await confirm({
      title: 'Excluir coleta?',
      message: `${wasteFromValue(coleta.TipoResiduo).longLabel} de ${formatLitros(litros(coleta))}. Essa ação não pode ser desfeita.`,
      confirmLabel: 'Excluir',
      destructive: true,
    });
    if (!ok) return;
    setDeleting(true);
    try {
      await remove(coleta);
      toast('Coleta excluída.');
      navigation.goBack();
    } catch (e) {
      toast(e.message, 'error');
      setDeleting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={{ paddingHorizontal: 20 }}>
        <TopBar title="Editar coleta" onBack={navigation.goBack} />
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ColetaFields
          value={form}
          onChange={setForm}
          showTypeSelector
          bagOptions={BAG_SIZES.includes(coleta.TamanhoSaco) ? BAG_SIZES : [...BAG_SIZES, coleta.TamanhoSaco].sort((a, b) => a - b)}
        />
      </ScrollView>
      <View style={styles.footer}>
        <Button title="Salvar alterações" onPress={save} loading={saving} disabled={!form.saco} />
        <Button title="Excluir coleta" variant="ghostDanger" onPress={confirmDelete} loading={deleting} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  content: { paddingHorizontal: 20, paddingBottom: 24 },
  footer: { paddingHorizontal: 20, paddingTop: 12, gap: 4, borderTopWidth: 1, borderTopColor: colors.divider },
});
