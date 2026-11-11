import React, { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Link, Screen, TextField } from '../../components/ui';
import { BrandMark } from '../../components/coleta';
import { useAuth } from '../../contexts/AuthContext';
import { colors, type } from '../../theme';
import { isValidEmail } from '../../utils/format';

export default function Login({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const senhaRef = useRef(null);

  const validateEmail = () => {
    if (email && !isValidEmail(email)) setErrors((e) => ({ ...e, email: 'Digite um e-mail válido, como nome@ecouni.dev.' }));
  };

  const submit = async () => {
    if (loading) return;
    const next = {};
    if (!isValidEmail(email)) next.email = 'Digite um e-mail válido, como nome@ecouni.dev.';
    if (!senha) next.senha = 'Digite sua senha.';
    setErrors(next);
    setFormError('');
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      await login(email, senha);
    } catch (e) {
      setFormError(e.status === 401 ? 'E-mail ou senha incorretos. Confira e tente de novo.' : e.message);
      setLoading(false);
    }
  };

  return (
    <Screen scroll keyboard contentStyle={{ paddingTop: 24 }}>
      <BrandMark row size={40} wordSize={20} />
      <Text style={[type.display, { marginTop: 40 }]} accessibilityRole="header">
        Entrar na sua conta
      </Text>
      <Text style={[type.body, { color: colors.muted, marginTop: 4 }]}>Use seu e-mail institucional</Text>

      <View style={{ marginTop: 12 }}>
        <TextField
          label="E-mail"
          icon="mail"
          placeholder="nome@ecouni.dev"
          value={email}
          onChangeText={(v) => {
            setEmail(v);
            if (errors.email) setErrors((e) => ({ ...e, email: undefined }));
          }}
          onBlur={validateEmail}
          error={errors.email}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          keyboardType="email-address"
          inputMode="email"
          textContentType="username"
          returnKeyType="next"
          enterKeyHint="next"
          onSubmitEditing={() => senhaRef.current?.focus()}
        />
        <TextField
          ref={senhaRef}
          label="Senha"
          icon="lock"
          placeholder="Sua senha"
          secure
          value={senha}
          onChangeText={(v) => {
            setSenha(v);
            if (errors.senha) setErrors((e) => ({ ...e, senha: undefined }));
          }}
          error={errors.senha}
          autoCapitalize="none"
          autoComplete="password"
          textContentType="password"
          returnKeyType="done"
          enterKeyHint="done"
          onSubmitEditing={submit}
        />
      </View>

      <View style={styles.forgot}>
        <Link title="Esqueci minha senha" onPress={() => navigation.navigate('RecuperarEmail', { email })} />
      </View>

      {formError ? (
        <Text style={styles.formError} accessibilityLiveRegion="assertive">
          {formError}
        </Text>
      ) : null}

      <Button title="Entrar" onPress={submit} loading={loading} />

      <View style={styles.footer}>
        <Text style={type.caption}>Sem acesso? </Text>
        <Link title="Fale com o administrador" onPress={() => navigation.navigate('FaleConosco', { assunto: 'Outro' })} style={{ fontSize: 13 }} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  forgot: { alignItems: 'flex-end', marginTop: 8, marginBottom: 16 },
  formError: { ...type.caption, color: colors.danger, fontSize: 14, marginBottom: 12 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 'auto', paddingTop: 32, flexWrap: 'wrap' },
});
