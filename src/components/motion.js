import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text } from 'react-native';
import { EASE_OUT, duration, useReducedMotion } from '../utils/motion';

export function AnimatedNumber({ value, format = (n) => Math.round(n).toLocaleString('pt-BR'), style, ms = 600 }) {
  const reduced = useReducedMotion();
  const anim = useRef(new Animated.Value(value)).current;
  const [shown, setShown] = useState(value);

  useEffect(() => {
    const id = anim.addListener(({ value: v }) => setShown(v));
    Animated.timing(anim, { toValue: value, duration: duration(ms, reduced), easing: EASE_OUT, useNativeDriver: false }).start();
    return () => anim.removeListener(id);
  }, [value]);

  return (
    <Text style={style} accessibilityLabel={format(value)}>
      {format(shown)}
    </Text>
  );
}

export function FadeIn({ children, index = 0, style, from = 10 }) {
  const reduced = useReducedMotion();
  const v = useRef(new Animated.Value(reduced ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: duration(260, reduced), delay: reduced ? 0 : Math.min(index, 8) * 40, easing: EASE_OUT, useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View style={[style, { opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [from, 0] }) }] }]}>
      {children}
    </Animated.View>
  );
}
