import React, { forwardRef, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, fonts, radius, type, HIT_SLOP } from '../theme';

export const Touchable = ({ style, children, disabled, ...props }) => (
  <Pressable
    disabled={disabled}
    android_ripple={null}
    style={({ pressed }) => [
      typeof style === 'function' ? style({ pressed }) : style,
      pressed && !disabled && { opacity: 0.85, transform: [{ scale: 0.98 }] },
    ]}
    {...props}
  >
    {children}
  </Pressable>
);

export const Screen = ({ children, scroll = false, padded = true, edges = ['top'], contentStyle, keyboard = false, refreshControl, bg = colors.white }) => {
  const body = scroll ? (
    <ScrollView
      contentContainerStyle={[padded && styles.padded, { flexGrow: 1, paddingBottom: 24 }, contentStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      refreshControl={refreshControl}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[{ flex: 1 }, padded && styles.padded, contentStyle]}>{children}</View>
  );
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }} edges={edges}>
      {keyboard ? (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {body}
        </KeyboardAvoidingView>
      ) : (
        body
      )}
    </SafeAreaView>
  );
};

export const TopBar = ({ title, icon = 'arrow-left', onBack, right, large = false }) => (
  <View style={styles.topBar}>
    {onBack ? (
      <Touchable
        onPress={onBack}
        hitSlop={HIT_SLOP}
        style={styles.iconBtn}
        accessibilityRole="button"
        accessibilityLabel={icon === 'x' ? 'Fechar' : 'Voltar'}
      >
        <Feather name={icon} size={24} color={colors.ink} />
      </Touchable>
    ) : null}
    {title ? (
      <Text style={[large ? type.h1 : styles.topBarTitle, { flex: 1 }]} accessibilityRole="header" numberOfLines={1}>
        {title}
      </Text>
    ) : (
      <View style={{ flex: 1 }} />
    )}
    {right}
  </View>
);

export const IconButton = ({ icon, onPress, label, family = 'feather', size = 20 }) => {
  const Icon = family === 'mci' ? MaterialCommunityIcons : Feather;
  return (
    <Touchable onPress={onPress} style={styles.iconOutline} accessibilityRole="button" accessibilityLabel={label} hitSlop={HIT_SLOP}>
      <Icon name={icon} size={size} color={colors.ink} />
    </Touchable>
  );
};

export const Button = ({ title, onPress, variant = 'primary', loading = false, disabled = false, icon, style, accessibilityLabel }) => {
  const v = BUTTON_VARIANTS[variant];
  const isDisabled = disabled || loading;
  return (
    <Touchable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={[styles.button, v.container, isDisabled && styles.buttonDisabled, style]}
    >
      {loading ? (
        <ActivityIndicator color={v.text.color} />
      ) : (
        <>
          {icon ? <Feather name={icon} size={18} color={v.text.color} /> : null}
          {title ? <Text style={[styles.buttonText, v.text]}>{title}</Text> : null}
        </>
      )}
    </Touchable>
  );
};

const BUTTON_VARIANTS = {
  primary: { container: { backgroundColor: colors.navy }, text: { color: colors.white } },
  outline: { container: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border }, text: { color: colors.navy } },
  danger: { container: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.dangerBorder }, text: { color: colors.danger } },
  ghost: { container: { backgroundColor: 'transparent' }, text: { color: colors.muted } },
  ghostDanger: { container: { backgroundColor: 'transparent' }, text: { color: colors.danger } },
};

export const Link = ({ title, onPress, style }) => (
  <Touchable onPress={onPress} hitSlop={HIT_SLOP} accessibilityRole="link" style={styles.link}>
    <Text style={[type.link, style]}>{title}</Text>
  </Touchable>
);

export const Label = ({ children, optional, style }) => (
  <Text style={[styles.label, style]}>
    {children}
    {optional ? <Text style={styles.optional}> {optional}</Text> : null}
  </Text>
);

export const TextField = forwardRef(
  ({ label, optional, icon, error, hint, secure = false, multiline = false, style, inputStyle, right, onFocus, onBlur, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const [hidden, setHidden] = useState(secure);
    return (
      <View style={style}>
        {label ? <Label optional={optional}>{label}</Label> : null}
        <View
          style={[
            styles.field,
            multiline && styles.fieldMultiline,
            (focused || props.value) && styles.fieldActive,
            focused && styles.fieldFocused,
            error && styles.fieldError,
          ]}
        >
          {icon ? <Feather name={icon} size={18} color={colors.placeholder} style={multiline && { marginTop: 2 }} /> : null}
          <TextInput
            ref={ref}
            style={[styles.input, multiline && styles.inputMultiline, inputStyle]}
            placeholderTextColor={colors.placeholder}
            secureTextEntry={hidden}
            multiline={multiline}
            textAlignVertical={multiline ? 'top' : 'center'}
            accessibilityLabel={label}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
            {...props}
          />
          {secure ? (
            <Touchable
              onPress={() => setHidden((h) => !h)}
              hitSlop={HIT_SLOP}
              style={styles.eye}
              accessibilityRole="button"
              accessibilityLabel={hidden ? 'Mostrar senha' : 'Ocultar senha'}
            >
              <Feather name={hidden ? 'eye' : 'eye-off'} size={18} color={colors.placeholder} />
            </Touchable>
          ) : null}
          {right}
        </View>
        {error ? (
          <Text style={styles.error} accessibilityLiveRegion="polite">
            {error}
          </Text>
        ) : hint ? (
          <Text style={styles.hint}>{hint}</Text>
        ) : null}
      </View>
    );
  }
);

export const SelectField = ({ label, icon, value, placeholder, onPress, accessibilityLabel }) => (
  <View>
    {label ? <Label>{label}</Label> : null}
    <Touchable
      onPress={onPress}
      style={[styles.field, styles.fieldActive]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || `${label}: ${value || placeholder}`}
    >
      {icon ? <Feather name={icon} size={18} color={colors.placeholder} /> : null}
      <Text style={[styles.input, !value && { color: colors.placeholder }]} numberOfLines={1}>
        {value || placeholder}
      </Text>
      <Feather name="chevron-down" size={18} color={colors.placeholder} />
    </Touchable>
  </View>
);

export const Chip = ({ label, selected, onPress, icon, tone, style }) => {
  const toned = tone && { backgroundColor: tone.bg, borderColor: 'transparent' };
  return (
    <Touchable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      style={[styles.chip, toned, selected && !tone && styles.chipSelected, tone && !selected && styles.chipOff, style]}
    >
      {icon ? <Feather name={icon} size={14} color={tone ? tone.fg : selected ? colors.white : colors.text2} /> : null}
      <Text style={[styles.chipText, tone && { color: tone.fg }, selected && !tone && { color: colors.white }]}>{label}</Text>
    </Touchable>
  );
};

export const ChipRow = ({ children, scroll = false, style }) =>
  scroll ? (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ flexGrow: 0, flexShrink: 0 }}
      contentContainerStyle={[styles.chipRow, { alignItems: 'center' }, style]}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.chipRow, { flexWrap: 'wrap' }, style]}>{children}</View>
  );

export const ChoiceGrid = ({ options, value, onChange, format = (v) => v, columns = 4, accessibilityLabel }) => (
  <View style={styles.grid} accessibilityRole="radiogroup" accessibilityLabel={accessibilityLabel}>
    {options.map((opt) => {
      const sel = opt === value;
      return (
        <Touchable
          key={opt}
          onPress={() => onChange(opt)}
          accessibilityRole="radio"
          accessibilityState={{ selected: sel }}
          style={[styles.gridItem, { width: `${100 / columns - 2}%` }, sel && styles.gridItemSelected]}
        >
          <Text style={[styles.gridText, sel && { color: colors.white }]}>{format(opt)}</Text>
        </Touchable>
      );
    })}
  </View>
);

export const Stepper = ({ value, onChange, min = 1, max = 99, label = 'Quantidade' }) => (
  <View style={styles.stepper} accessibilityRole="adjustable" accessibilityLabel={label} accessibilityValue={{ now: value, min, max }}
    accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
    onAccessibilityAction={(e) => onChange(Math.min(max, Math.max(min, value + (e.nativeEvent.actionName === 'increment' ? 1 : -1))))}
  >
    <Touchable
      onPress={() => onChange(Math.max(min, value - 1))}
      disabled={value <= min}
      style={[styles.stepBtn, value <= min && { opacity: 0.4 }]}
      accessibilityLabel="Diminuir"
    >
      <Feather name="minus" size={20} color={colors.navy} />
    </Touchable>
    <Text style={styles.stepValue}>{value}</Text>
    <Touchable
      onPress={() => onChange(Math.min(max, value + 1))}
      disabled={value >= max}
      style={[styles.stepBtn, value >= max && { opacity: 0.4 }]}
      accessibilityLabel="Aumentar"
    >
      <Feather name="plus" size={20} color={colors.navy} />
    </Touchable>
  </View>
);

export const Segmented = ({ options, value, onChange, renderOption, style }) => {
  const [width, setWidth] = useState(0);
  const index = Math.max(0, options.findIndex((o) => o.value === value));
  const pos = useRef(new Animated.Value(index)).current;
  useEffect(() => {
    Animated.spring(pos, { toValue: index, useNativeDriver: true, speed: 20, bounciness: 4 }).start();
  }, [index, pos]);
  const PAD = 3;
  const GAP = 3;
  const segW = width ? (width - PAD * 2 - GAP * (options.length - 1)) / options.length : 0;

  return (
    <View style={[styles.segmented, style]} accessibilityRole="tablist" onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {segW ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.segmentSelected,
            styles.segmentPill,
            { width: segW, transform: [{ translateX: pos.interpolate({ inputRange: [0, 1], outputRange: [0, segW + GAP] }) }] },
          ]}
        />
      ) : null}
      {options.map((opt) => {
        const sel = opt.value === value;
        return (
          <Touchable key={opt.value} onPress={() => onChange(opt.value)} accessibilityRole="tab" accessibilityState={{ selected: sel }} style={styles.segment}>
            {renderOption ? renderOption(opt, sel) : <Text style={[styles.segmentText, sel && { color: colors.ink }]}>{opt.label}</Text>}
          </Touchable>
        );
      })}
    </View>
  );
};

export const Toggle = ({ value, onChange, label }) => {
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: value ? 1 : 0, duration: 150, useNativeDriver: false }).start();
  }, [value, anim]);
  return (
    <Touchable
      onPress={() => onChange(!value)}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      hitSlop={HIT_SLOP}
      style={styles.toggleHit}
    >
      <Animated.View
        style={[styles.toggle, { backgroundColor: anim.interpolate({ inputRange: [0, 1], outputRange: [colors.border, colors.navy] }) }]}
      >
        <Animated.View style={[styles.knob, { transform: [{ translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [0, 20] }) }] }]} />
      </Animated.View>
    </Touchable>
  );
};

export const Avatar = ({ text, size = 40, dark = false, children }) => (
  <View
    style={[
      styles.avatar,
      { width: size, height: size, borderRadius: size / 2, backgroundColor: dark ? colors.navy : colors.navySoft },
    ]}
    accessible={false}
  >
    <Text style={{ fontFamily: fonts.extrabold, fontSize: size * 0.34, color: dark ? colors.white : colors.navy }}>{text}</Text>
    {children}
  </View>
);

export const RoleBadge = ({ admin }) => (
  <View style={styles.role}>
    <Text style={styles.roleText}>{admin ? 'Administrador' : 'Colaborador'}</Text>
  </View>
);

export const SectionTitle = ({ children, style }) => <Text style={[styles.sectionTitle, style]}>{children}</Text>;

export const MenuItem = ({ icon, label, onPress, danger, last }) => (
  <Touchable onPress={onPress} style={[styles.menuItem, last && { borderBottomWidth: 0 }]} accessibilityRole="button" accessibilityLabel={label}>
    <Feather name={icon} size={22} color={danger ? colors.danger : colors.brand} />
    <Text style={[styles.menuText, danger && { color: colors.danger }]}>{label}</Text>
    {!danger ? <Feather name="chevron-right" size={20} color={colors.chevron} /> : null}
  </Touchable>
);

export const EmptyState = ({ icon = 'inbox', title, message, actionLabel, onAction }) => (
  <View style={styles.state}>
    <View style={styles.stateIcon}>
      <Feather name={icon} size={26} color={colors.navy} />
    </View>
    <Text style={[type.title, { textAlign: 'center' }]}>{title}</Text>
    {message ? <Text style={[type.caption, styles.stateMsg]}>{message}</Text> : null}
    {actionLabel ? <Button title={actionLabel} onPress={onAction} variant="outline" style={{ marginTop: 16, paddingHorizontal: 20 }} /> : null}
  </View>
);

export const ErrorState = ({ message, onRetry }) => (
  <EmptyState icon="wifi-off" title="Não foi possível carregar" message={message} actionLabel="Tentar novamente" onAction={onRetry} />
);

export const Skeleton = ({ height = 16, width = '100%', radius: r = radius.md, style }) => {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.5, duration: 750, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 750, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  return <Animated.View style={[{ height, width, borderRadius: r, backgroundColor: colors.mist, opacity: pulse }, style]} />;
};

export const ListSkeleton = ({ rows = 5 }) => (
  <View style={{ gap: 14, marginTop: 8 }} accessibilityLabel="Carregando">
    {Array.from({ length: rows }).map((_, i) => (
      <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Skeleton width={44} height={44} radius={radius.lg} />
        <View style={{ flex: 1, gap: 6 }}>
          <Skeleton width="55%" height={14} />
          <Skeleton width="30%" height={12} />
        </View>
        <Skeleton width={44} height={16} />
      </View>
    ))}
  </View>
);

export const InfoBox = ({ icon = 'info', children }) => (
  <View style={styles.info}>
    <Feather name={icon} size={18} color={colors.infoText} />
    <Text style={styles.infoText}>{children}</Text>
  </View>
);

const styles = StyleSheet.create({
  padded: { paddingHorizontal: 20 },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 56 },
  topBarTitle: { fontFamily: fonts.extrabold, fontSize: 18, color: colors.ink },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginLeft: -10 },
  iconOutline: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    height: 52,
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { fontFamily: fonts.bold, fontSize: 16 },
  link: { minHeight: 32, justifyContent: 'center' },
  label: { ...type.label, marginTop: 14, marginBottom: 6 },
  optional: { fontFamily: fonts.medium, color: colors.muted },
  field: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.mist,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
  },
  fieldMultiline: { minHeight: 110, alignItems: 'flex-start', paddingTop: 12, paddingBottom: 12 },
  fieldActive: { backgroundColor: colors.white },
  fieldFocused: { borderColor: colors.brand, borderWidth: 1.5 },
  fieldError: { borderColor: colors.danger },
  input: { flex: 1, fontFamily: fonts.medium, fontSize: 15, color: colors.ink, paddingVertical: 12 },
  inputMultiline: { minHeight: 86, paddingVertical: 0, lineHeight: 21 },
  eye: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', marginRight: -8 },
  error: { fontFamily: fonts.semibold, fontSize: 13, color: colors.danger, marginTop: 6 },
  hint: { ...type.small, marginTop: 6 },
  chipRow: { flexDirection: 'row', gap: 8 },
  chip: {
    minHeight: 36,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chipSelected: { backgroundColor: colors.navy, borderColor: colors.navy },
  chipOff: { opacity: 0.45 },
  chipText: { fontFamily: fonts.bold, fontSize: 13, color: colors.text2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 8 },
  gridItem: {
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridItemSelected: { backgroundColor: colors.navy, borderColor: colors.navy },
  gridText: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 4,
  },
  stepBtn: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.mist, alignItems: 'center', justifyContent: 'center' },
  stepValue: { fontFamily: fonts.extrabold, fontSize: 18, color: colors.ink },
  segmented: { flexDirection: 'row', backgroundColor: colors.mist, borderRadius: radius.lg, padding: 3, gap: 3 },
  segment: { flex: 1, minHeight: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'transparent' },
  segmentSelected: { backgroundColor: colors.white, borderColor: colors.border },
  segmentPill: { position: 'absolute', top: 3, bottom: 3, left: 3, borderRadius: radius.md, borderWidth: 1 },
  segmentText: { fontFamily: fonts.bold, fontSize: 13, color: colors.muted },
  toggleHit: { padding: 4 },
  toggle: { width: 46, height: 26, borderRadius: 13, padding: 3 },
  knob: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.white },
  avatar: { alignItems: 'center', justifyContent: 'center' },
  role: { alignSelf: 'flex-start', backgroundColor: colors.navySoft, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3 },
  roleText: { fontFamily: fonts.bold, fontSize: 12, color: colors.navy },
  sectionTitle: { ...type.small, fontFamily: fonts.bold, marginTop: 20, marginBottom: 2 },
  menuItem: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  menuText: { flex: 1, fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
  state: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 40, paddingHorizontal: 24 },
  stateIcon: { width: 56, height: 56, borderRadius: 18, backgroundColor: colors.navySoft, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  stateMsg: { textAlign: 'center', marginTop: 6, maxWidth: 300 },
  info: { flexDirection: 'row', gap: 10, backgroundColor: colors.infoSoft, borderRadius: radius.lg, padding: 12 },
  infoText: { flex: 1, fontFamily: fonts.medium, fontSize: 13, lineHeight: 19, color: colors.infoText },
});
