import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrandMark } from '../../components/coleta';
import { colors, type } from '../../theme';

export default function Splash({ navigation }) {
  useEffect(() => {
    const t = setTimeout(() => navigation.replace('Login'), 1400);
    return () => clearTimeout(t);
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <BrandMark size={84} wordSize={32} />
      </View>
      <Text style={[type.caption, styles.footer]}>Centro Universitário</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  footer: { textAlign: 'center', marginBottom: 24 },
});
