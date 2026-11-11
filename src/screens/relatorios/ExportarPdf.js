import React, { useMemo, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Sharing from 'expo-sharing';
import { Button, Label, Toggle, TopBar } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { useColetas } from '../../contexts/ColetasContext';
import { useToast } from '../../contexts/ToastContext';
import { colors, fonts, radius, type } from '../../theme';
import { applyFilters, periodLabel } from './reportData';
import { buildReportPdf, savePdfToFolder, writeTempPdf } from './pdf';

export default function ExportarPdf({ navigation, route }) {
  const { granularity } = route.params;
  const filters = useMemo(
    () => ({ ...route.params.filters, from: new Date(route.params.filters.from), to: new Date(route.params.filters.to) }),
    [route.params.filters]
  );
  const { user } = useAuth();
  const { coletas } = useColetas();
  const toast = useToast();
  const [summary, setSummary] = useState(true);
  const [listOn, setListOn] = useState(true);
  const [busy, setBusy] = useState(null);

  const list = useMemo(() => applyFilters(coletas, filters), [coletas, filters]);
  const estimatedPages = (summary ? 1 : 0) + (listOn ? Math.max(1, Math.ceil((list.length - (summary ? 10 : 0)) / 36)) : 0);
  const fileName = `Relatorio_EcoUni_${new Date().toISOString().slice(0, 10)}.pdf`;
  const nothing = !summary && !listOn;

  const build = () => buildReportPdf({ list, filters, granularity, includeSummary: summary, includeList: listOn, showPeople: !!user?.IsAdmin });

  const run = async (mode) => {
    if (busy || nothing) return;
    setBusy(mode);
    await new Promise((r) => setTimeout(r, 30));
    try {
      const { base64 } = build();
      if (mode === 'share' || Platform.OS !== 'android') {
        const uri = await writeTempPdf(base64, fileName);
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Compartilhar relatório', UTI: 'com.adobe.pdf' });
      } else {
        const saved = await savePdfToFolder(base64, fileName);
        if (saved) toast('PDF salvo na pasta escolhida.');
      }
    } catch (e) {
      toast('Não foi possível gerar o PDF. Tente novamente.', 'error');
    } finally {
      setBusy(null);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={{ paddingHorizontal: 20 }}>
        <TopBar title="Exportar relatório" icon="x" onBack={navigation.goBack} />
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16 }}>
        <View style={styles.previewBox} accessible accessibilityLabel={`Prévia do PDF, cerca de ${estimatedPages} páginas`}>
          <View style={styles.page}>
            <View style={[styles.bar, { width: '55%', height: 6, backgroundColor: colors.navy }]} />
            <View style={[styles.bar, { width: '35%', height: 4, backgroundColor: '#C4CDD6' }]} />
            {summary ? (
              <>
                <View style={{ flexDirection: 'row', gap: 4, marginTop: 4 }}>
                  <View style={[styles.bar, { flex: 1, height: 16, backgroundColor: '#EEF2F6' }]} />
                  <View style={[styles.bar, { flex: 1, height: 16, backgroundColor: '#EEF2F6' }]} />
                </View>
                <View style={styles.miniChart}>
                  {[12, 20, 17, 9, 22, 26, 15, 19].map((h, i) => (
                    <View key={i} style={{ flex: 1, height: h, backgroundColor: '#9FB3C8', borderRadius: 1 }} />
                  ))}
                </View>
              </>
            ) : null}
            {listOn ? [1, 2, 3, 4].map((i) => <View key={i} style={[styles.bar, { height: 4, backgroundColor: '#E3E8EE', width: i === 4 ? '60%' : '100%' }]} />) : null}
          </View>
          <Text style={[type.small, { marginTop: 10 }]}>{nothing ? 'Ative pelo menos uma seção' : `Prévia, cerca de ${estimatedPages} ${estimatedPages === 1 ? 'página' : 'páginas'}`}</Text>
        </View>

        <Text style={[type.caption, { marginTop: 12 }]}>
          {periodLabel(filters)}
          {filters.colaborador ? ` · ${filters.colaborador}` : ''}
        </Text>

        <Label>Incluir no PDF</Label>
        <View style={styles.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={type.bodyStrong}>Resumo e gráfico</Text>
            <Text style={type.caption}>Totais por tipo e barras por {granularity === 'dia' ? 'dia' : granularity === 'semana' ? 'semana' : 'mês'}</Text>
          </View>
          <Toggle value={summary} onChange={setSummary} label="Incluir resumo e gráfico" />
        </View>
        <View style={[styles.toggleRow, { borderBottomWidth: 0 }]}>
          <View style={{ flex: 1 }}>
            <Text style={type.bodyStrong}>Lista de coletas</Text>
            <Text style={type.caption}>
              {list.length} {list.length === 1 ? 'coleta' : 'coletas'} no período
            </Text>
          </View>
          <Toggle value={listOn} onChange={setListOn} label="Incluir lista de coletas" />
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Button icon="share-2" variant="outline" onPress={() => run('share')} loading={busy === 'share'} disabled={nothing || !!busy} style={{ width: 56, paddingHorizontal: 0 }} accessibilityLabel="Compartilhar PDF" />
        <Button title={Platform.OS === 'android' ? 'Salvar PDF' : 'Gerar PDF'} onPress={() => run('save')} loading={busy === 'save'} disabled={nothing || !!busy} style={{ flex: 1 }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  previewBox: { backgroundColor: colors.mist, borderRadius: radius.xl, paddingVertical: 18, alignItems: 'center', marginTop: 4 },
  page: { width: 132, height: 170, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 4, padding: 10, gap: 6 },
  bar: { borderRadius: 2 },
  miniChart: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 30, marginTop: 2 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 64, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.divider },
  footer: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8, borderTopWidth: 1, borderTopColor: colors.divider },
});
