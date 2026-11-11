import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, fonts, radius } from '../theme';
import { Touchable } from './ui';

export const BrandMark = ({ size = 72, wordSize = 28, row = false }) => (
  <View style={[{ alignItems: 'center' }, row && { flexDirection: 'row', gap: 10 }]} accessible accessibilityLabel="EcoUni">
    <View style={[styles.logo, { width: size, height: size, borderRadius: size * 0.3 }]}>
      <MaterialCommunityIcons name="recycle" size={size * 0.58} color={colors.white} />
    </View>
    <Text style={[styles.word, { fontSize: wordSize, marginTop: row ? 0 : 14 }]}>
      ECO<Text style={{ color: colors.brand }}>U</Text>NI
    </Text>
  </View>
);

export const WasteIcon = ({ type: t, size = 44 }) => (
  <View style={[styles.wasteIcon, { width: size, height: size, borderRadius: size * 0.3, backgroundColor: t.bg }]}>
    <MaterialCommunityIcons name={t.icon} size={size * 0.52} color={t.fg} />
  </View>
);

export const WasteTag = ({ type: t }) => (
  <View style={[styles.tag, { backgroundColor: t.bg }]}>
    <MaterialCommunityIcons name={t.icon} size={16} color={t.fg} />
    <Text style={[styles.tagText, { color: t.fg }]}>{t.longLabel}</Text>
  </View>
);

export const ColetaRow = ({ type: t, title, subtitle, amount, onPress, last }) => {
  const content = (
    <>
      <WasteIcon type={t} />
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSub} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      <Text style={styles.rowAmount}>{amount}</Text>
    </>
  );
  const style = [styles.row, last && { borderBottomWidth: 0 }];
  return onPress ? (
    <Touchable onPress={onPress} style={style} accessibilityRole="button" accessibilityLabel={`${title}, ${subtitle}, ${amount}`} accessibilityHint="Abre os detalhes">
      {content}
    </Touchable>
  ) : (
    <View style={style} accessible accessibilityLabel={`${title}, ${subtitle}, ${amount}`}>
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  logo: { backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' },
  word: { fontFamily: fonts.extrabold, letterSpacing: 1, color: colors.navy },
  wasteIcon: { alignItems: 'center', justifyContent: 'center' },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6 },
  tagText: { fontFamily: fonts.bold, fontSize: 13 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 64, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.divider },
  rowTitle: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
  rowSub: { fontFamily: fonts.medium, fontSize: 13, color: colors.muted, marginTop: 2 },
  rowAmount: { fontFamily: fonts.extrabold, fontSize: 16, color: colors.ink },
});
