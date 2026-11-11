import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Alert, Animated, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Button } from '../components/ui';
import { colors, fonts, radius, type } from '../theme';
import { EASE_OUT, duration, useReducedMotion } from '../utils/motion';

const DialogContext = createContext(null);

export function DialogProvider({ children }) {
  const [dialog, setDialog] = useState(null);
  const resolver = useRef(null);

  const confirm = useCallback((opts) => {
    const o = { cancelLabel: 'Cancelar', confirmLabel: 'Confirmar', ...opts };
    if (Platform.OS === 'ios') {
      return new Promise((resolve) =>
        Alert.alert(o.title, o.message, [
          { text: o.cancelLabel, style: 'cancel', onPress: () => resolve(false) },
          { text: o.confirmLabel, style: o.destructive ? 'destructive' : 'default', onPress: () => resolve(true) },
        ])
      );
    }
    return new Promise((resolve) => {
      resolver.current = resolve;
      setDialog(o);
    });
  }, []);

  const close = (result) => {
    resolver.current?.(result);
    resolver.current = null;
    setDialog(null);
  };

  return (
    <DialogContext.Provider value={confirm}>
      {children}
      <AndroidDialog dialog={dialog} onClose={close} />
    </DialogContext.Provider>
  );
}

export const useConfirm = () => useContext(DialogContext);

function AndroidDialog({ dialog, onClose }) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(null);
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (dialog) {
      setShown(dialog);
      Animated.timing(anim, { toValue: 1, duration: duration(200, reduced), easing: EASE_OUT, useNativeDriver: true }).start();
    } else if (shown) {
      Animated.timing(anim, { toValue: 0, duration: duration(150, reduced), useNativeDriver: true }).start(() => setShown(null));
    }
  }, [dialog]);

  if (!shown) return null;
  const d = shown;
  const icon = d.icon || (d.destructive ? 'alert-triangle' : 'help-circle');

  return (
    <Modal transparent visible statusBarTranslucent animationType="none" onRequestClose={() => onClose(false)}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: anim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => onClose(false)} accessibilityLabel="Fechar" />
      </Animated.View>
      <View style={styles.center} pointerEvents="box-none">
        <Animated.View
          accessibilityViewIsModal
          accessibilityRole="alert"
          style={[styles.card, { opacity: anim, transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) }] }]}
        >
          <View style={[styles.icon, { backgroundColor: d.destructive ? '#FBE9E7' : colors.navySoft }]}>
            <Feather name={icon} size={24} color={d.destructive ? colors.danger : colors.navy} />
          </View>
          <Text style={[type.h2, { marginTop: 14 }]}>{d.title}</Text>
          {d.message ? <Text style={styles.message}>{d.message}</Text> : null}
          <View style={styles.actions}>
            <Button title={d.cancelLabel} variant="outline" onPress={() => onClose(false)} style={{ flex: 1 }} />
            <Button
              title={d.confirmLabel}
              onPress={() => onClose(true)}
              style={[{ flex: 1 }, d.destructive && { backgroundColor: colors.danger }]}
            />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: colors.backdrop },
  center: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  card: { backgroundColor: colors.white, borderRadius: radius.sheet, padding: 22 },
  icon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  message: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 22, color: colors.text2, marginTop: 6 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 22 },
});
