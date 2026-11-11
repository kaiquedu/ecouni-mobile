import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Button, InfoBox, Link, Screen, TextField, TopBar } from '../../components/ui';
import { colors, fonts, radius, type } from '../../theme';
import { isValidEmail, maskEmail, passwordRules, passwordStrength } from '../../utils/format';

const Progress = ({ step, onBack }) => (
  <>
    <TopBar onBack={onBack} right={<Text style={[type.caption, { fontFamily: fonts.semibold }]}>Etapa {step} de 3</Text>} />
    <View style={styles.progress} accessibilityLabel={`Etapa ${step} de 3`}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={[styles.bar, i <= step && { backgroundColor: colors.navy }]} />
      ))}
    </View>
  </>
);

export function RecuperarEmail({ navigation, route }) {
  const [email, setEmail] = useState(route.params?.email || '');
  const [error, setError] = useState('');
  const next = () => {
    if (!isValidEmail(email)) return setError('Digite um e-mail válido, como nome@ecouni.dev.');
    navigation.navigate('RecuperarCodigo', { email: email.trim() });
  };
  return (
    <Screen scroll keyboard>
      <Progress step={1} onBack={navigation.goBack} />
      <Text style={type.h1} accessibilityRole="header">
        Esqueceu a senha?
      </Text>
      <Text style={[type.body, styles.lead]}>Informe o e-mail da sua conta e enviaremos um código de verificação.</Text>
      <TextField
        label="E-mail"
        icon="mail"
        placeholder="nome@ecouni.dev"
        value={email}
        onChangeText={(v) => {
          setEmail(v);
          setError('');
        }}
        onBlur={() => email && !isValidEmail(email) && setError('Digite um e-mail válido, como nome@ecouni.dev.')}
        error={error}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        enterKeyHint="send"
        returnKeyType="send"
        onSubmitEditing={next}
      />
      <Button title="Enviar código" onPress={next} style={{ marginTop: 20 }} />
      <View style={{ marginTop: 16 }}>
        <InfoBox>Demonstração: o envio de código ainda não está ligado à API. Use qualquer código de 4 dígitos.</InfoBox>
      </View>
    </Screen>
  );
}

export function RecuperarCodigo({ navigation, route }) {
  const email = route.params?.email || '';
  const [code, setCode] = useState('');
  const [seconds, setSeconds] = useState(45);
  const inputRef = useRef(null);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  return (
    <Screen scroll keyboard>
      <Progress step={2} onBack={navigation.goBack} />
      <Text style={type.h1} accessibilityRole="header">
        Confira seu e-mail
      </Text>
      <Text style={[type.body, styles.lead]}>
        Digite o código de 4 dígitos enviado para <Text style={{ fontFamily: fonts.bold, color: colors.ink }}>{maskEmail(email)}</Text>
      </Text>
      <View style={styles.otpRow} onTouchEnd={() => inputRef.current?.focus()} accessibilityLabel={`Código: ${code.split('').join(' ') || 'vazio'}`}>
        {[0, 1, 2, 3].map((i) => {
          const active = i === Math.min(code.length, 3);
          return (
            <View key={i} style={[styles.otp, active && styles.otpActive]}>
              <Text style={styles.otpText}>{code[i] || ''}</Text>
            </View>
          );
        })}
        <TextInput
          ref={inputRef}
          value={code}
          onChangeText={(v) => setCode(v.replace(/\D/g, '').slice(0, 4))}
          keyboardType="number-pad"
          autoComplete="one-time-code"
          textContentType="oneTimeCode"
          maxLength={4}
          autoFocus
          style={styles.hiddenInput}
          accessibilityLabel="Código de verificação"
        />
      </View>
      {seconds > 0 ? (
        <Text style={type.caption}>
          Reenviar código em <Text style={{ fontFamily: fonts.bold, color: colors.ink }}>0:{String(seconds).padStart(2, '0')}</Text>
        </Text>
      ) : (
        <Link title="Reenviar código" onPress={() => setSeconds(45)} />
      )}
      <Button title="Verificar" disabled={code.length < 4} onPress={() => navigation.navigate('NovaSenha')} style={{ marginTop: 20 }} />
    </Screen>
  );
}

export function NovaSenha({ navigation }) {
  const [senha, setSenha] = useState('');
  const [confirma, setConfirma] = useState('');
  const [touched, setTouched] = useState(false);
  const rules = passwordRules(senha);
  const strength = passwordStrength(senha);
  const valid = rules.every((r) => r.ok) && senha === confirma;
  const mismatch = touched && confirma && senha !== confirma;

  return (
    <Screen scroll keyboard>
      <Progress step={3} onBack={navigation.goBack} />
      <Text style={type.h1} accessibilityRole="header">
        Crie uma nova senha
      </Text>
      <PasswordFields
        senha={senha}
        setSenha={setSenha}
        confirma={confirma}
        setConfirma={setConfirma}
        rules={rules}
        strength={strength}
        mismatch={mismatch}
        onBlurConfirm={() => setTouched(true)}
      />
      <Button title="Salvar nova senha" disabled={!valid} onPress={() => navigation.replace('SenhaAtualizada')} style={{ marginTop: 20 }} />
    </Screen>
  );
}

export function PasswordFields({ senha, setSenha, confirma, setConfirma, rules, strength, mismatch, onBlurConfirm, label = 'Nova senha' }) {
  const colorsByScore = ['#E3E8EE', colors.danger, '#D98A00', colors.success, colors.success];
  return (
    <View>
      <TextField label={label} secure value={senha} onChangeText={setSenha} autoCapitalize="none" autoComplete="new-password" textContentType="newPassword" placeholder="Mínimo de 8 caracteres" />
      <View style={styles.strength} accessibilityLabel={strength.label ? `Força da senha: ${strength.label}` : undefined}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={[styles.strengthBar, i <= strength.score && { backgroundColor: colorsByScore[strength.score] }]} />
        ))}
      </View>
      <View style={styles.strengthRow}>
        <Text style={type.small}>Força da senha</Text>
        <Text style={[type.small, { fontFamily: fonts.bold, color: colorsByScore[strength.score] }]}>{strength.label}</Text>
      </View>
      <View style={{ gap: 6, marginTop: 10 }}>
        {rules.map((r) => (
          <View key={r.key} style={styles.rule} accessibilityLabel={`${r.label}: ${r.ok ? 'atendido' : 'pendente'}`}>
            <Feather name={r.ok ? 'check-circle' : 'circle'} size={16} color={r.ok ? colors.success : colors.chevron} />
            <Text style={[type.caption, { color: colors.text2 }]}>{r.label}</Text>
          </View>
        ))}
      </View>
      <TextField
        label="Confirmar senha"
        secure
        value={confirma}
        onChangeText={setConfirma}
        onBlur={onBlurConfirm}
        autoCapitalize="none"
        autoComplete="new-password"
        error={mismatch ? 'As senhas não conferem. Digite a mesma senha nos dois campos.' : undefined}
        right={confirma && senha === confirma ? <Feather name="check" size={18} color={colors.success} /> : null}
      />
    </View>
  );
}

export function SenhaAtualizada({ navigation }) {
  return (
    <Screen>
      <View style={styles.doneCenter}>
        <View style={styles.doneIcon}>
          <Feather name="check" size={36} color={colors.success} />
        </View>
        <Text style={[type.h1, { marginTop: 20, textAlign: 'center' }]} accessibilityRole="header">
          Senha atualizada
        </Text>
        <Text style={[type.body, { color: colors.muted, textAlign: 'center', marginTop: 6 }]}>Use a nova senha para entrar no EcoUni.</Text>
      </View>
      <Button title="Ir para o login" onPress={() => navigation.popToTop()} style={{ marginBottom: 16 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  progress: { flexDirection: 'row', gap: 6, marginTop: 4, marginBottom: 24 },
  bar: { flex: 1, height: 5, borderRadius: 3, backgroundColor: '#E3E8EE' },
  lead: { color: colors.muted, marginTop: 8, marginBottom: 4 },
  otpRow: { flexDirection: 'row', gap: 10, marginTop: 24, marginBottom: 14 },
  otp: { flex: 1, height: 60, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  otpActive: { borderColor: colors.brand, borderWidth: 1.5 },
  otpText: { fontFamily: fonts.extrabold, fontSize: 24, color: colors.navy },
  hiddenInput: { position: 'absolute', opacity: 0, width: 1, height: 1 },
  strength: { flexDirection: 'row', gap: 4, marginTop: 10 },
  strengthBar: { flex: 1, height: 5, borderRadius: 3, backgroundColor: '#E3E8EE' },
  strengthRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  rule: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  doneCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  doneIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.successSoft, alignItems: 'center', justifyContent: 'center' },
});
