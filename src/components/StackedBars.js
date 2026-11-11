import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { WASTE_ORDER, WASTE_TYPES, colors, fonts } from '../theme';
import { formatLitros } from '../utils/format';
import { EASE_OUT, duration, useReducedMotion } from '../utils/motion';

function Bar({ item, max, height, index, reduced, animKey }) {
  const target = Math.max(item.total ? 3 : 0, (item.total / max) * height);
  const h = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(h, { toValue: target, duration: duration(420, reduced), delay: reduced ? 0 : index * 35, easing: EASE_OUT, useNativeDriver: false }),
      Animated.timing(fade, { toValue: 1, duration: duration(220, reduced), delay: reduced ? 0 : index * 35, useNativeDriver: false }),
    ]).start();
  }, [target, animKey]);

  return (
    <View style={styles.col} accessible accessibilityLabel={`${item.label}: ${formatLitros(item.total)}`}>
      <Animated.View style={[styles.bar, { height: h, opacity: fade }]}>
        {WASTE_ORDER.slice()
          .reverse()
          .map((k) => (item[k] > 0 ? <View key={k} style={{ flex: item[k], backgroundColor: WASTE_TYPES[k].color }} /> : null))}
      </Animated.View>
    </View>
  );
}

export default function StackedBars({ data, height = 140, animKey }) {
  const reduced = useReducedMotion();
  const max = Math.max(1, ...data.map((d) => d.total));
  const swap = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (reduced) return;
    swap.setValue(0);
    Animated.timing(swap, { toValue: 1, duration: 260, easing: EASE_OUT, useNativeDriver: true }).start();
  }, [animKey]);

  return (
    <Animated.View style={{ opacity: swap, transform: [{ translateY: swap.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }] }}>
      <View style={[styles.chart, { height }]}>
        {data.map((d, i) => (
          <Bar key={`${animKey}-${d.label}`} item={d} max={max} height={height} index={i} reduced={reduced} animKey={animKey} />
        ))}
      </View>
      <View style={styles.labels}>
        {data.map((d) => (
          <Text key={d.label} style={styles.label} numberOfLines={1}>
            {d.label}
          </Text>
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, borderBottomWidth: 1, borderBottomColor: colors.divider },
  col: { flex: 1, justifyContent: 'flex-end' },
  bar: { borderTopLeftRadius: 4, borderTopRightRadius: 4, overflow: 'hidden', gap: 1 },
  labels: { flexDirection: 'row', gap: 6, marginTop: 6 },
  label: { flex: 1, textAlign: 'center', fontFamily: fonts.semibold, fontSize: 11, color: colors.muted },
});
