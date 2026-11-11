import React, { useMemo, useState } from 'react';
import { RefreshControl, SectionList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Chip, ChipRow, EmptyState, ErrorState, IconButton, ListSkeleton, TextField } from '../../components/ui';
import { ColetaRow } from '../../components/coleta';
import { ColetaDetailSheet } from '../../components/sheets';
import NovaColetaFab from '../../components/Fab';
import { useAuth } from '../../contexts/AuthContext';
import { useColetas } from '../../contexts/ColetasContext';
import { useToast } from '../../contexts/ToastContext';
import { WASTE_ORDER, WASTE_TYPES, colors, fonts, type, wasteFromValue } from '../../theme';
import { formatDayHeader, formatLitros, formatTime, groupByDay, litros, parseDate } from '../../utils/format';

export default function Historico({ navigation }) {
  const { user } = useAuth();
  const { coletas, status, error, refreshing, refresh, reload, remove } = useColetas();
  const toast = useToast();
  const [filter, setFilter] = useState('todos');
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);

  const sections = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = coletas.filter((c) => {
      const t = wasteFromValue(c.TipoResiduo);
      if (filter !== 'todos' && t.key !== filter) return false;
      if (!q) return true;
      return [t.longLabel, c.Observacoes, c.NomeColaborador, `${c.TamanhoSaco} l`].some((s) => s && s.toLowerCase().includes(q));
    });
    return groupByDay(list).map((g) => ({ title: formatDayHeader(g.date), total: g.total, key: g.key, data: g.items }));
  }, [coletas, filter, query]);

  const onDelete = async (c) => {
    try {
      await remove(c);
      setSelected(null);
      toast('Coleta excluída.');
    } catch (e) {
      toast(e.message, 'error');
    }
  };

  const header = (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <Text style={[type.h1, { flex: 1 }]} accessibilityRole="header">
          Histórico
        </Text>
        <IconButton
          icon={searchOpen ? 'x' : 'search'}
          label={searchOpen ? 'Fechar busca' : 'Buscar coletas'}
          onPress={() => {
            setSearchOpen((o) => !o);
            setQuery('');
          }}
        />
      </View>
      {searchOpen ? (
        <TextField
          icon="search"
          placeholder="Buscar por tipo, observação ou pessoa"
          value={query}
          onChangeText={setQuery}
          autoFocus
          returnKeyType="search"
          enterKeyHint="search"
          style={{ marginTop: 4 }}
        />
      ) : null}
      <ChipRow scroll style={{ paddingVertical: 12 }}>
        <Chip label="Todos" selected={filter === 'todos'} onPress={() => setFilter('todos')} />
        {WASTE_ORDER.map((k) => (
          <Chip key={k} label={WASTE_TYPES[k].label} selected={filter === k} onPress={() => setFilter(k)} />
        ))}
      </ChipRow>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {header}
      {status === 'loading' ? (
        <View style={{ paddingHorizontal: 20 }}>
          <ListSkeleton rows={7} />
        </View>
      ) : status === 'error' ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(c) => String(c.Id)}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100, flexGrow: 1 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} colors={[colors.navy]} tintColor={colors.navy} />}
          initialNumToRender={14}
          windowSize={7}
          renderSectionHeader={({ section }) => (
            <View style={styles.groupHead} accessibilityRole="header">
              <Text style={styles.groupText}>{section.title}</Text>
              <Text style={styles.groupText}>{formatLitros(section.total)}</Text>
            </View>
          )}
          renderItem={({ item, index, section }) => {
            const t = wasteFromValue(item.TipoResiduo);
            const time = formatTime(parseDate(item.DataRegistro));
            return (
              <ColetaRow
                type={t}
                title={t.longLabel}
                subtitle={user?.IsAdmin && item.NomeColaborador ? `${time} · ${item.NomeColaborador}` : time}
                amount={formatLitros(litros(item))}
                onPress={() => setSelected(item)}
                last={index === section.data.length - 1}
              />
            );
          }}
          ListEmptyComponent={
            coletas.length === 0 ? (
              <EmptyState icon="plus-circle" title="Nenhuma coleta registrada" message="Toque no botão + para registrar a primeira coleta." />
            ) : (
              <EmptyState
                icon="search"
                title="Nada encontrado"
                message="Nenhuma coleta corresponde a esse filtro."
                actionLabel="Limpar filtros"
                onAction={() => {
                  setFilter('todos');
                  setQuery('');
                }}
              />
            )
          }
        />
      )}
      <NovaColetaFab />
      <ColetaDetailSheet
        coleta={selected}
        onClose={() => setSelected(null)}
        onDelete={onDelete}
        onEdit={(c) => {
          setSelected(null);
          navigation.navigate('EditarColeta', { coleta: c });
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: { paddingHorizontal: 20 },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  groupHead: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 16, paddingBottom: 4 },
  groupText: { fontFamily: fonts.bold, fontSize: 13, color: colors.muted },
});
