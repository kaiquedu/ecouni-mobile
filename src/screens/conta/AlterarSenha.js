import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { Button, Screen, TopBar } from '../../components/ui';
import { PasswordFields } from '../auth/RecuperarSenha';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { api } from '../../services/api';
import { colors, type } from '../../theme';
import { passwordRules, passwordStrength } from '../../utils/format';

export default function AlterarSenha({ navigation }) {
  const { user } = useAuth();
  const toast = useToast();
  const [senha, setSenha] = useState('');
  const [confirma, setConfirma] = useState('');
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const rules = passwordRules(senha);
  const valid = rules.every((r) => r.ok) && senha === confirma;

  const save = async () => {
    if (!valid || saving) return;
    setSaving(true);
    try {
      const u = await api.getUser(user.Cadastrarid);
      await api.updateUser(user.Cadastrarid, { Nome: u.Nome, Telefone: u.Telefone, Email: u.Email, Senha: senha, ConfirmarSenha: confirma });
      toast('Senha alterada.');
      navigation.goBack();
    } catch (e) {
      toast(e.message, 'error');
      setSaving(false);
    }
  };

  return (
    <Screen scroll keyboard edges={['top', 'bottom']}>
      <TopBar title="Alterar senha" onBack={navigation.goBack} />
      <Text style={[type.body, { color: colors.muted }]}>A nova senha vale a partir do próximo login.</Text>
      <PasswordFields
        senha={senha}
        setSenha={setSenha}
        confirma={confirma}
        setConfirma={setConfirma}
        rules={rules}
        strength={passwordStrength(senha)}
        mismatch={touched && confirma && senha !== confirma}
        onBlurConfirm={() => setTouched(true)}
      />
      <View style={{ flex: 1, minHeight: 24 }} />
      <Button title="Salvar nova senha" onPress={save} disabled={!valid} loading={saving} style={{ marginBottom: 8 }} />
    </Screen>
  );
}
