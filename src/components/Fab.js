import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Touchable } from './ui';
import { NovaColetaSheet } from './sheets';
import { colors } from '../theme';

export default function NovaColetaFab() {
  const navigation = useNavigation();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Touchable onPress={() => setOpen(true)} style={styles.fab} accessibilityRole="button" accessibilityLabel="Registrar nova coleta">
        <Feather name="plus" size={28} color={colors.white} />
      </Touchable>
      <NovaColetaSheet
        visible={open}
        onClose={() => setOpen(false)}
        onSelect={(tipo) => {
          setOpen(false);
          navigation.navigate('RegistrarColeta', { tipo });
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: colors.navy,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
});
