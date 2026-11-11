import React, { useMemo, useState } from 'react';
import { LayoutAnimation, Platform, StyleSheet, Text, UIManager, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { EmptyState, Link, Screen, TextField, Touchable, TopBar } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { colors, fonts, radius, type } from '../../theme';
import { FAQ } from './content';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Ajuda({ navigation, route }) {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(0);
  const asTab = route.name === 'AjudaTab';

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQ.filter((f) => (!f.admin || user?.IsAdmin) && (!q || f.q.toLowerCase().includes(q) || f.steps.some((s) => s.toLowerCase().includes(q))));
  }, [query, user]);

  const toggle = (i) => {
    LayoutAnimation.configureNext(LayoutAnimation.create(180, 'easeInEaseOut', 'opacity'));
    setOpen((o) => (o === i ? -1 : i));
  };

  return (
    <Screen scroll keyboard>
      {asTab ? (
        <Text style={[type.h1, { marginTop: 12, marginBottom: 4 }]} accessibilityRole="header">
          Central de ajuda
        </Text>
      ) : (
        <TopBar title="Central de ajuda" onBack={navigation.goBack} />
      )}
      <TextField icon="search" placeholder="Buscar dúvidas" value={query} onChangeText={setQuery} returnKeyType="search" enterKeyHint="search" style={{ marginTop: 8 }} />

      {items.length === 0 ? (
        <EmptyState icon="search" title="Nenhuma dúvida encontrada" message="Tente outra palavra ou envie sua pergunta para a equipe." />
      ) : (
        <View style={{ marginTop: 12 }}>
          {items.map((f, i) => {
            const expanded = open === i;
            return (
              <View key={f.q} style={[styles.item, expanded && styles.itemOpen]}>
                <Touchable onPress={() => toggle(i)} style={styles.question} accessibilityRole="button" accessibilityState={{ expanded }}>
                  <Text style={[type.bodyStrong, { flex: 1 }]}>{f.q}</Text>
                  <Feather name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color={colors.muted} />
                </Touchable>
                {expanded ? (
                  <View style={styles.steps}>
                    {f.steps.map((s, n) => (
                      <View key={s} style={styles.step}>
                        <View style={styles.stepNum}>
                          <Text style={styles.stepNumText}>{n + 1}</Text>
                        </View>
                        <Text style={[type.body, { flex: 1, color: colors.text2, fontSize: 14 }]}>{s}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
      )}

      <View style={styles.contact}>
        <Text style={type.bodyStrong}>Ainda com dúvida?</Text>
        <Text style={[type.caption, { marginTop: 2, marginBottom: 4 }]}>A equipe EcoUni responde pelo seu e-mail.</Text>
        <Link title="Enviar mensagem" onPress={() => navigation.navigate('FaleConosco')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  item: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  itemOpen: { borderWidth: 1, borderColor: colors.borderSoft, borderRadius: radius.lg, paddingHorizontal: 12, marginBottom: 8 },
  question: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 10 },
  steps: { gap: 8, paddingBottom: 14 },
  step: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  stepNum: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.navySoft, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  stepNumText: { fontFamily: fonts.bold, fontSize: 12, color: colors.navy },
  contact: { marginTop: 'auto', backgroundColor: colors.mist, borderRadius: radius.lg, padding: 14, marginBottom: 8, marginTop: 24 },
});
