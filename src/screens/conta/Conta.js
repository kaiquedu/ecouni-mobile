import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useConfirm } from '../../contexts/DialogContext';
import { Feather } from '@expo/vector-icons';
import { Avatar, MenuItem, RoleBadge, Screen, SectionTitle, Touchable } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { colors, radius, type } from '../../theme';
import { initials } from '../../utils/format';

export default function Conta({ navigation }) {
  const { user, logout } = useAuth();
  const confirm = useConfirm();
  const confirmLogout = async () => {
    const ok = await confirm({
      title: 'Sair da conta?',
      message: 'Você vai precisar entrar de novo com e-mail e senha.',
      confirmLabel: 'Sair',
      destructive: true,
      icon: 'log-out',
    });
    if (ok) logout();
  };

  return (
    <Screen scroll>
      <Text style={[type.h1, { marginTop: 12, marginBottom: 14 }]} accessibilityRole="header">
        Conta
      </Text>
      <Touchable onPress={() => navigation.navigate('DadosPessoais')} style={styles.profile} accessibilityRole="button" accessibilityLabel={`${user?.Nome}, ${user?.IsAdmin ? 'Administrador' : 'Colaborador'}. Editar dados pessoais`}>
        <Avatar text={initials(user?.Nome)} size={52} dark />
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={type.bodyStrong} numberOfLines={1}>
            {user?.Nome}
          </Text>
          <RoleBadge admin={user?.IsAdmin} />
        </View>
        <Feather name="chevron-right" size={20} color={colors.chevron} />
      </Touchable>

      <SectionTitle>Segurança</SectionTitle>
      <MenuItem icon="key" label="Alterar senha" onPress={() => navigation.navigate('AlterarSenha')} last />

      {user?.IsAdmin ? (
        <>
          <SectionTitle>Administração</SectionTitle>
          <MenuItem icon="user-plus" label="Cadastrar usuário" onPress={() => navigation.navigate('NovoUsuario')} last />
        </>
      ) : null}

      <SectionTitle>Suporte</SectionTitle>
      <MenuItem icon="help-circle" label="Ajuda e contato" onPress={() => navigation.navigate('Ajuda')} />
      <MenuItem icon="shield" label="Termos e privacidade" onPress={() => navigation.navigate('TermosPrivacidade')} last />

      <View style={{ marginTop: 16 }}>
        <MenuItem icon="log-out" label="Sair da conta" danger onPress={confirmLogout} last />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  profile: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: colors.borderSoft, borderRadius: radius.xl, padding: 12 },
});
