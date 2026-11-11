import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen, Segmented, TopBar } from '../../components/ui';
import { colors, fonts, type } from '../../theme';
import { PRIVACY, TERMS, UPDATED_AT } from './content';

export default function TermosPrivacidade({ navigation, route }) {
  const [tab, setTab] = useState(route.params?.tab || 'termos');
  const sections = tab === 'termos' ? TERMS : PRIVACY;
  return (
    <Screen scroll edges={['top', 'bottom']}>
      <TopBar title="Termos e privacidade" onBack={navigation.goBack} />
      <Segmented
        options={[
          { value: 'termos', label: 'Termos de uso' },
          { value: 'privacidade', label: 'Privacidade' },
        ]}
        value={tab}
        onChange={setTab}
      />
      <Text style={[type.caption, { marginTop: 14 }]}>Última atualização: {UPDATED_AT}</Text>
      <View style={styles.body}>
        {sections.map(([title, text]) => (
          <View key={title}>
            <Text style={styles.h} accessibilityRole="header">
              {title}
            </Text>
            <Text style={styles.p}>{text}</Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { maxWidth: 640 },
  h: { fontFamily: fonts.extrabold, fontSize: 15, color: colors.navy, marginTop: 18 },
  p: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 23, color: colors.text2, marginTop: 4 },
});
