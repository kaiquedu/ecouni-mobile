import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Link, TopBar } from '../../components/ui';
import { WasteTag } from '../../components/coleta';
import { NovaColetaSheet } from '../../components/sheets';
import { ColetaFields, TotalBar } from '../../components/ColetaForm';
import { useColetas } from '../../contexts/ColetasContext';
import { useToast } from '../../contexts/ToastContext';
import { WASTE_TYPES, colors } from '../../theme';
import { formatLitros } from '../../utils/format';

export default function RegistrarColeta({ navigation, route }) {
  const { create } = useColetas();
  const toast = useToast();
  const [form, setForm] = useState({ tipo: route.params?.tipo || 'reciclavel', saco: null, quantidade: 1, data: new Date(), observacoes: '' });
  const [trocar, setTrocar] = useState(false);
  const [saving, setSaving] = useState(false);
  const t = WASTE_TYPES[form.tipo];

  const submit = async () => {
    if (saving || !form.saco) return;
    setSaving(true);
    try {
      await create({
        TipoResiduo: t.value,
        TamanhoSaco: form.saco,
        Quantidade: form.quantidade,
        Observacoes: form.observacoes,
        DataRegistro: toLocalIso(form.data),
      });
      toast(`Coleta de ${formatLitros(form.saco * form.quantidade)} registrada.`);
      navigation.goBack();
    } catch (e) {
      toast(e.message, 'error');
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={{ paddingHorizontal: 20 }}>
        <TopBar title="Registrar coleta" icon="x" onBack={navigation.goBack} />
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.typeRow}>
          <WasteTag type={t} />
          <Link title="Trocar" onPress={() => setTrocar(true)} />
        </View>
        <ColetaFields value={form} onChange={setForm} />
      </ScrollView>
      <View style={{ paddingHorizontal: 20 }}>
        <TotalBar value={form}>
          <Button title="Registrar" onPress={submit} loading={saving} disabled={!form.saco} accessibilityLabel={form.saco ? 'Registrar coleta' : 'Selecione o tamanho do saco para registrar'} />
        </TotalBar>
      </View>
      <NovaColetaSheet
        visible={trocar}
        onClose={() => setTrocar(false)}
        onSelect={(tipo) => {
          setForm((f) => ({ ...f, tipo }));
          setTrocar(false);
        }}
      />
    </SafeAreaView>
  );
}

export const toLocalIso = (d) => {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:00`;
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  content: { paddingHorizontal: 20, paddingBottom: 24 },
  typeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
});
