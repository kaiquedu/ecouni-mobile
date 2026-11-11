import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, Button, ErrorState, RoleBadge, Screen, Skeleton, TextField, TopBar } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { api } from '../../services/api';
import { initials, isValidEmail, isValidPhone, maskPhone } from '../../utils/format';

export default function DadosPessoais({ navigation }) {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [loadError, setLoadError] = useState(null);
  const [saving, setSaving] = useState(false);
  const phoneRef = useRef(null);
  const emailRef = useRef(null);

  const load = async () => {
    setLoadError(null);
    try {
      const u = await api.getUser(user.Cadastrarid);
      setForm({ Nome: u.Nome, Telefone: maskPhone(u.Telefone), Email: u.Email });
    } catch (e) {
      setLoadError(e.message);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const validate = (f = form) => {
    const e = {};
    if (!f.Nome.trim()) e.Nome = 'Informe seu nome.';
    if (!isValidPhone(f.Telefone)) e.Telefone = 'Digite um telefone com DDD, como (11) 90000-0000.';
    if (!isValidEmail(f.Email)) e.Email = 'Digite um e-mail válido, como nome@ecouni.dev.';
    return e;
  };
  const blur = (field) => setErrors((e) => ({ ...e, [field]: validate()[field] }));

  const save = async () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length || saving) return;
    setSaving(true);
    try {
      const u = await api.updateUser(user.Cadastrarid, { Nome: form.Nome.trim(), Telefone: form.Telefone, Email: form.Email.trim() });
      updateUser({ Nome: u.Nome, Email: u.Email, Telefone: u.Telefone });
      toast('Dados atualizados.');
      navigation.goBack();
    } catch (err) {
      toast(err.message, 'error');
      setSaving(false);
    }
  };

  const set = (field) => (v) => {
    setForm((f) => ({ ...f, [field]: field === 'Telefone' ? maskPhone(v) : v }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  return (
    <Screen scroll keyboard edges={['top', 'bottom']}>
      <TopBar title="Dados pessoais" onBack={navigation.goBack} />
      <View style={styles.avatar}>
        <Avatar text={initials(form?.Nome || user?.Nome)} size={76} />
        <RoleBadge admin={user?.IsAdmin} />
      </View>
      {loadError ? (
        <ErrorState message={loadError} onRetry={load} />
      ) : !form ? (
        <View style={{ gap: 14, marginTop: 20 }}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={50} />
          ))}
        </View>
      ) : (
        <>
          <TextField label="Nome" value={form.Nome} onChangeText={set('Nome')} onBlur={() => blur('Nome')} error={errors.Nome} autoComplete="name" textContentType="name" autoCapitalize="words" returnKeyType="next" enterKeyHint="next" onSubmitEditing={() => phoneRef.current?.focus()} />
          <TextField ref={phoneRef} label="Telefone" value={form.Telefone} onChangeText={set('Telefone')} onBlur={() => blur('Telefone')} error={errors.Telefone} keyboardType="phone-pad" inputMode="tel" autoComplete="tel" textContentType="telephoneNumber" returnKeyType="next" enterKeyHint="next" onSubmitEditing={() => emailRef.current?.focus()} />
          <TextField ref={emailRef} label="E-mail" value={form.Email} onChangeText={set('Email')} onBlur={() => blur('Email')} error={errors.Email} keyboardType="email-address" inputMode="email" autoCapitalize="none" autoComplete="email" returnKeyType="done" enterKeyHint="done" onSubmitEditing={save} />
          <View style={{ flex: 1, minHeight: 24 }} />
          <Button title="Salvar alterações" onPress={save} loading={saving} style={{ marginBottom: 8 }} />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  avatar: { alignItems: 'center', gap: 10, marginTop: 4, marginBottom: 4 },
});
