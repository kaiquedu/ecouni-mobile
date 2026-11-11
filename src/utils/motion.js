import { useEffect, useState } from 'react';
import { AccessibilityInfo, Easing } from 'react-native';

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled?.().then((v) => alive && setReduced(!!v));
    const sub = AccessibilityInfo.addEventListener?.('reduceMotionChanged', (v) => setReduced(!!v));
    return () => {
      alive = false;
      sub?.remove?.();
    };
  }, []);
  return reduced;
}

export const EASE_OUT = Easing.out(Easing.cubic);
export const duration = (ms, reduced) => (reduced ? 0 : ms);
