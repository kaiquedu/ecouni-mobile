import React, { useMemo, useState } from 'react';
import { Platform, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Feather } from '@expo/vector-icons';
import BottomSheet from '../../components/BottomSheet';
import StackedBars from '../../components/StackedBars';
import { AnimatedNumber } from '../../components/motion';
import { Button, Chip, ChipRow, EmptyState, ErrorState, IconButton, Label, Screen, Segmented, Skeleton, Touchable } from '../../components/ui';
import { useColetas } from '../../contexts/ColetasContext';
import { WASTE_ORDER, WASTE_TYPES, colors, fonts, radius, type } from '../../theme';
import { formatDate, formatLitros } from '../../utils/format';
import { PERIODS, applyFilters, buckets, colaboradores, defaultFilters, periodLabel, summarize } from './reportData';

const GRANULARITY = [
  { value: 'dia', label: 'Dia' },
  { value: 'semana', label: 'Semana' },
  { value: 'mes', label: 'Mês' },
];

export default function Relatorios({ navigation }) {
  const { coletas, status, error, refreshing, refresh, reload } = useColetas();
  const [filters, setFilters] = useState(defaultFilters);
  const [granularity, setGranularity] = useState('dia');
  const [sheet, setSheet] = useState(false);

  const list = useMemo(() => applyFilters(coletas, filters), [coletas, filters]);
  const sum = useMemo(() => summarize(list), [list]);
  const bars = useMemo(() => buckets(list, filters, granularity), [list, filters, granularity]);
  const activeFilters = (filters.types.length < 3 ? 1 : 0) + (filters.colaborador ? 1 : 0);

  return (
    <Screen
      scroll
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} colors={[colors.navy]} tintColor={colors.navy} />}
    >
      <View style={styles.titleRow}>
        <Text style={[type.h1, { flex: 1 }]} accessibilityRole="header">
          Relatórios
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View>
            <IconButton icon="sliders" label="Filtrar relatório" onPress={() => setSheet(true)} />
            {activeFilters ? <View style={styles.badge} /> : null}
          </View>
          <IconButton icon="download" label="Exportar PDF" onPress={() => navigation.navigate('ExportarPdf', { filters: { ...filters, from: filters.from.getTime(), to: filters.to.getTime() }, granularity })} />
        </View>
      </View>

      <ChipRow scroll style={{ paddingVertical: 12 }}>
        {PERIODS.map((p) => (
          <Chip
            key={p.value}
            label={p.label}
            selected={filters.period === p.value}
            onPress={() => (p.value === 'custom' ? setSheet(true) : setFilters((f) => ({ ...f, period: p.value })))}
          />
        ))}
      </ChipRow>
      <Text style={type.caption}>
        {periodLabel(filters)}
        {filters.colaborador ? ` · ${filters.colaborador}` : ''}
      </Text>

      {status === 'loading' ? (
        <View style={{ gap: 10, marginTop: 12 }}>
          <Skeleton height={76} radius={radius.lg} />
          <Skeleton height={260} radius={radius.xl} />
        </View>
      ) : status === 'error' ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <>
          <View style={styles.kpis}>
            <View style={styles.kpi}>
              <Text style={type.caption}>Volume total</Text>
              <AnimatedNumber value={sum.totals.total} format={formatLitros} style={styles.kpiValue} />
            </View>
            <View style={styles.kpi}>
              <Text style={type.caption}>Reciclado</Text>
              <AnimatedNumber value={sum.reciclado * 100} format={(n) => `${Math.round(n)}%`} style={[styles.kpiValue, { color: colors.success }]} />
            </View>
          </View>

          <View style={styles.chartCard}>
            <Segmented options={GRANULARITY} value={granularity} onChange={setGranularity} />
            {sum.count === 0 ? (
              <EmptyState icon="bar-chart-2" title="Sem coletas no período" message="Ajuste o período ou os filtros para ver o resumo." actionLabel="Limpar filtros" onAction={() => setFilters(defaultFilters())} />
            ) : (
              <>
                <View style={{ marginTop: 16 }}>
                  <StackedBars data={bars} animKey={`${granularity}|${periodLabel(filters)}|${filters.types.join()}|${filters.colaborador || ''}`} />
                </View>
                <View style={{ marginTop: 12 }}>
                  {WASTE_ORDER.map((k) => (
                    <View key={k} style={styles.legendRow}>
                      <View style={[styles.square, { backgroundColor: WASTE_TYPES[k].color }]} />
                      <Text style={[type.caption, { color: colors.ink, flex: 1, fontFamily: fonts.semibold }]}>{WASTE_TYPES[k].label}</Text>
                      <AnimatedNumber value={sum.totals[k]} format={formatLitros} style={styles.legendValue} />
                      <AnimatedNumber value={sum.pct(k)} format={(n) => `${Math.round(n)}%`} style={styles.legendPct} />
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>
          <Text style={[type.small, { marginTop: 10 }]}>
            {sum.count} {sum.count === 1 ? 'coleta' : 'coletas'} no período
          </Text>
        </>
      )}

      <FiltersSheet
        visible={sheet}
        initial={filters}
        people={colaboradores(coletas)}
        onClose={() => setSheet(false)}
        onApply={(f) => {
          setFilters(f);
          setSheet(false);
        }}
      />
    </Screen>
  );
}

function FiltersSheet({ visible, initial, people, onClose, onApply }) {
  const [f, setF] = useState(initial);
  const [picker, setPicker] = useState(null);
  const [peopleOpen, setPeopleOpen] = useState(false);

  React.useEffect(() => {
    if (visible) setF(initial);
  }, [visible]);

  const toggleType = (k) =>
    setF((s) => {
      const has = s.types.includes(k);
      if (has && s.types.length === 1) return s;
      return { ...s, types: has ? s.types.filter((t) => t !== k) : [...s.types, k] };
    });

  return (
    <BottomSheet visible={visible} onClose={onClose} accessibilityLabel="Filtrar relatório">
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.sheetHead}>
          <Text style={type.h2} accessibilityRole="header">
            Filtrar relatório
          </Text>
          <Touchable onPress={onClose} accessibilityRole="button" accessibilityLabel="Fechar" style={styles.close}>
            <Feather name="x" size={24} color={colors.ink} />
          </Touchable>
        </View>

        <Label>Período</Label>
        <ChipRow>
          {PERIODS.map((p) => (
            <Chip key={p.value} label={p.label} selected={f.period === p.value} onPress={() => setF((s) => ({ ...s, period: p.value }))} />
          ))}
        </ChipRow>
        {f.period === 'custom' ? (
          <View style={styles.dates}>
            <DateBox label="De" value={f.from} onPress={() => setPicker('from')} />
            <DateBox label="Até" value={f.to} onPress={() => setPicker('to')} />
          </View>
        ) : null}
        {picker ? (
          <DateTimePicker
            value={f[picker]}
            mode="date"
            maximumDate={new Date()}
            onChange={(e, d) => {
              const which = picker;
              setPicker(Platform.OS === 'ios' ? picker : null);
              if (e.type !== 'dismissed' && d) setF((s) => ({ ...s, [which]: d }));
            }}
          />
        ) : null}

        <Label>Tipo de resíduo</Label>
        <ChipRow>
          {WASTE_ORDER.map((k) => {
            const on = f.types.includes(k);
            return (
              <Chip key={k} label={WASTE_TYPES[k].label} icon={on ? 'check' : undefined} tone={WASTE_TYPES[k]} selected={on} onPress={() => toggleType(k)} />
            );
          })}
        </ChipRow>

        {people.length > 1 ? (
          <>
            <Label>Colaborador</Label>
            <Touchable onPress={() => setPeopleOpen((o) => !o)} style={styles.select} accessibilityRole="button" accessibilityState={{ expanded: peopleOpen }}>
              <Text style={[type.body, { flex: 1 }]} numberOfLines={1}>
                {f.colaborador || 'Todos os colaboradores'}
              </Text>
              <Feather name={peopleOpen ? 'chevron-up' : 'chevron-down'} size={20} color={colors.placeholder} />
            </Touchable>
            {peopleOpen ? (
              <View style={styles.options}>
                {[null, ...people].map((p) => (
                  <Touchable
                    key={p || 'todos'}
                    onPress={() => {
                      setF((s) => ({ ...s, colaborador: p }));
                      setPeopleOpen(false);
                    }}
                    style={styles.option}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: f.colaborador === p }}
                  >
                    <Text style={[type.body, { flex: 1 }]}>{p || 'Todos os colaboradores'}</Text>
                    {f.colaborador === p ? <Feather name="check" size={18} color={colors.navy} /> : null}
                  </Touchable>
                ))}
              </View>
            ) : null}
          </>
        ) : null}

        <View style={styles.sheetActions}>
          <Button title="Limpar" variant="outline" onPress={() => setF(defaultFilters())} style={{ flex: 1 }} />
          <Button title="Aplicar filtros" onPress={() => onApply(f)} style={{ flex: 1.4 }} />
        </View>
      </ScrollView>
    </BottomSheet>
  );
}

const DateBox = ({ label, value, onPress }) => (
  <Touchable onPress={onPress} style={styles.dateBox} accessibilityRole="button" accessibilityLabel={`${label}: ${formatDate(value)}. Toque para alterar`}>
    <Text style={type.small}>{label}</Text>
    <Text style={type.bodyStrong}>{formatDate(value)}</Text>
  </Touchable>
);

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  badge: { position: 'absolute', top: 6, right: 6, width: 9, height: 9, borderRadius: 5, backgroundColor: colors.brand, borderWidth: 2, borderColor: colors.white },
  kpis: { flexDirection: 'row', gap: 10, marginTop: 14 },
  kpi: { flex: 1, backgroundColor: colors.mist, borderRadius: radius.lg, padding: 14 },
  kpiValue: { fontFamily: fonts.extrabold, fontSize: 26, letterSpacing: -0.5, color: colors.ink, marginTop: 2 },
  chartCard: { borderWidth: 1, borderColor: colors.borderSoft, borderRadius: radius.xl, padding: 12, marginTop: 12 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  square: { width: 10, height: 10, borderRadius: 3 },
  legendValue: { fontFamily: fonts.extrabold, fontSize: 14, color: colors.ink },
  legendPct: { width: 44, textAlign: 'right', fontFamily: fonts.semibold, fontSize: 13, color: colors.muted },
  sheetHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginRight: -10 },
  dates: { flexDirection: 'row', gap: 10, marginTop: 10 },
  dateBox: { flex: 1, minHeight: 56, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 12, justifyContent: 'center' },
  select: { minHeight: 50, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14 },
  options: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, marginTop: 6 },
  option: { minHeight: 48, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: colors.divider },
  sheetActions: { flexDirection: 'row', gap: 10, marginTop: 24, marginBottom: 4 },
});
