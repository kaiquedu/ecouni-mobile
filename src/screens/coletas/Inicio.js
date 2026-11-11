import React, { useMemo, useState } from 'react';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Avatar, EmptyState, ErrorState, Link, ListSkeleton, Screen, Skeleton, Touchable } from '../../components/ui';
import { ColetaRow } from '../../components/coleta';
import { ColetaDetailSheet } from '../../components/sheets';
import NovaColetaFab from '../../components/Fab';
import { AnimatedNumber, FadeIn } from '../../components/motion';
import { useAuth } from '../../contexts/AuthContext';
import { useColetas } from '../../contexts/ColetasContext';
import { useToast } from '../../contexts/ToastContext';
import { WASTE_ORDER, WASTE_TYPES, colors, fonts, radius, type, wasteFromValue } from '../../theme';
import { firstName, formatLitros, formatLongToday, formatRelative, initials, isSameDay, litros, parseDate, totalsByType } from '../../utils/format';

const ON_NAVY = { reciclavel: '#F2B130', papel: '#7FA2F0', naoReciclavel: '#AEB8C4' };

export default function Inicio({ navigation }) {
  const { user } = useAuth();
  const { coletas, status, error, refreshing, refresh, reload, remove } = useColetas();
  const toast = useToast();
  const [selected, setSelected] = useState(null);

  const today = useMemo(() => coletas.filter((c) => isSameDay(parseDate(c.DataRegistro), new Date())), [coletas]);
  const totals = useMemo(() => totalsByType(today), [today]);
  const recent = coletas.slice(0, 5);

  const onDelete = async (c) => {
    try {
      await remove(c);
      setSelected(null);
      toast('Coleta excluída.');
    } catch (e) {
      toast(e.message, 'error');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <Screen scroll refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} colors={[colors.navy]} tintColor={colors.navy} />} contentStyle={{ paddingBottom: 96 }}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={type.caption}>{formatLongToday()}</Text>
            <Text style={type.h1} accessibilityRole="header" numberOfLines={1}>
              Olá, {firstName(user?.Nome)}
            </Text>
          </View>
          <Touchable onPress={() => navigation.navigate('Conta')} accessibilityRole="button" accessibilityLabel="Abrir conta" hitSlop={8}>
            <Avatar text={initials(user?.Nome)} size={44} />
          </Touchable>
        </View>

        {status === 'loading' ? (
          <Skeleton height={168} radius={radius.xxl} style={{ marginTop: 16 }} />
        ) : (
          <View style={styles.card} accessible accessibilityLabel={`Coletado hoje: ${formatLitros(totals.total)} em ${today.length} coletas`}>
            <View style={styles.cardTop}>
              <Text style={styles.cardMuted}>{user?.IsAdmin ? 'Coletado hoje, todos' : 'Coletado hoje'}</Text>
              <Text style={styles.cardMuted}>
                {today.length} {today.length === 1 ? 'coleta' : 'coletas'}
              </Text>
            </View>
            <View style={styles.cardValueRow}>
              <AnimatedNumber value={totals.total} style={styles.cardValue} ms={700} />
              <Text style={styles.cardUnit}>litros</Text>
            </View>
            <View style={styles.stack}>
              {totals.total > 0 ? (
                WASTE_ORDER.map((k) => (totals[k] > 0 ? <View key={k} style={{ flex: totals[k], backgroundColor: ON_NAVY[k] }} /> : null))
              ) : (
                <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.15)' }} />
              )}
            </View>
            <View style={styles.legend}>
              {WASTE_ORDER.map((k) => (
                <View key={k} style={styles.legendItem}>
                  <View style={[styles.dot, { backgroundColor: ON_NAVY[k] }]} />
                  <Text style={styles.legendText}>
                    {WASTE_TYPES[k].label} {formatLitros(totals[k])}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.sectionHead}>
          <Text style={[type.title, { fontSize: 16 }]} accessibilityRole="header">
            Últimas coletas
          </Text>
          <Link title="Ver histórico" onPress={() => navigation.navigate('Historico')} />
        </View>

        {status === 'loading' ? (
          <ListSkeleton rows={4} />
        ) : status === 'error' ? (
          <ErrorState message={error} onRetry={reload} />
        ) : recent.length === 0 ? (
          <EmptyState icon="plus-circle" title="Nenhuma coleta ainda" message="Toque no botão + para registrar a primeira coleta." />
        ) : (
          recent.map((c, i) => {
            const t = wasteFromValue(c.TipoResiduo);
            return (
              <FadeIn key={c.Id} index={i}>
              <ColetaRow
                type={t}
                title={t.longLabel}
                subtitle={user?.IsAdmin && c.NomeColaborador ? `${formatRelative(c.DataRegistro)} · ${c.NomeColaborador}` : formatRelative(c.DataRegistro)}
                amount={formatLitros(litros(c))}
                onPress={() => setSelected(c)}
                last={i === recent.length - 1}
              />
              </FadeIn>
            );
          })
        )}
      </Screen>
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
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 },
  card: { marginTop: 16, backgroundColor: colors.navy, borderRadius: radius.xxl, padding: 16 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between' },
  cardMuted: { fontFamily: fonts.medium, fontSize: 13, color: colors.navyText },
  cardValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 4, marginBottom: 12 },
  cardValue: { fontFamily: fonts.extrabold, fontSize: 38, letterSpacing: -1, color: colors.white },
  cardUnit: { fontFamily: fonts.semibold, fontSize: 16, color: colors.navyText },
  stack: { flexDirection: 'row', gap: 2, height: 10, borderRadius: 5, overflow: 'hidden' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 14, rowGap: 4, marginTop: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontFamily: fonts.medium, fontSize: 13, color: '#DCE5EE' },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 22, marginBottom: 2 },
});
