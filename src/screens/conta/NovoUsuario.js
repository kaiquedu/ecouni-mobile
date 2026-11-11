import React, { useRef, useState } from 'react';
import { View } from 'react-native';
import { Button, InfoBox, Screen, TextField, TopBar } from '../../components/ui';
import { useToast } from '../../contexts/ToastContext';
import { api } from '../../services/api';
import { isValidEmail, isValidPhone, maskPhone } from '../../utils/format';

export default function NovoUsuario({ navigation }) {
  const toast = useToast();
  const [form, setForm] = useState({ Nome: '', Email: '', Telefone: '', Senha: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const refs = { Email: useRef(null), Telefone: useRef(null), Senha: useRef(null) };

  const validate = (f = form) => {
    const e = {};
    if (f.Nome.trim().split(/\s+/).length < 2) e.Nome = 'Informe nome e sobrenome.';
    if (!isValidEmail(f.Email)) e.Email = 'Digite um e-mail válido, como nome@ecouni.dev.';
    if (!isValidPhone(f.Telefone)) e.Telefone = 'Digite um telefone com DDD, como (11) 90000-0000.';
    if (f.Senha.length < 8) e.Senha = 'A senha inicial precisa ter 8 ou mais caracteres.';
    return e;
  };
  const blur = (field) => form[field] && setErrors((e) => ({ ...e, [field]: validate()[field] }));
  const set = (field) => (v) => {
    setForm((f) => ({ ...f, [field]: field === 'Telefone' ? maskPhone(v) : v }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const submit = async () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length || saving) return;
    setSaving(true);
    try {
      await api.register({ Nome: form.Nome.trim(), Email: form.Email.trim(), Telefone: form.Telefone, Senha: form.Senha, ConfirmarSenha: form.Senha });
      toast(`${form.Nome.trim().split(' ')[0]} foi cadastrado.`);
      navigation.goBack();
    } catch (err) {
      if (err.status === 409) setErrors((x) => ({ ...x, Email: 'Já existe uma conta com este e-mail.' }));
      else toast(err.message, 'error');
      setSaving(false);
    }
  };

  return (
    <Screen scroll keyboard edges={['top', 'bottom']}>
      <TopBar title="Novo usuário" icon="x" onBack={navigation.goBack} />
      <TextField label="Nome completo" placeholder="Nome e sobrenome" value={form.Nome} onChangeText={set('Nome')} onBlur={() => blur('Nome')} error={errors.Nome} autoCapitalize="words" autoComplete="off" returnKeyType="next" enterKeyHint="next" onSubmitEditing={() => refs.Email.current?.focus()} />
      <TextField ref={refs.Email} label="E-mail institucional" placeholder="nome@ecouni.dev" value={form.Email} onChangeText={set('Email')} onBlur={() => blur('Email')} error={errors.Email} keyboardType="email-address" inputMode="email" autoCapitalize="none" autoComplete="off" returnKeyType="next" enterKeyHint="next" onSubmitEditing={() => refs.Telefone.current?.focus()} />
      <TextField ref={refs.Telefone} label="Telefone" placeholder="(11) 90000-0000" value={form.Telefone} onChangeText={set('Telefone')} onBlur={() => blur('Telefone')} error={errors.Telefone} keyboardType="phone-pad" inputMode="tel" returnKeyType="next" enterKeyHint="next" onSubmitEditing={() => refs.Senha.current?.focus()} />
      <TextField ref={refs.Senha} label="Senha inicial" placeholder="Mínimo de 8 caracteres" secure value={form.Senha} onChangeText={set('Senha')} onBlur={() => blur('Senha')} error={errors.Senha} autoCapitalize="none" autoComplete="off" returnKeyType="done" enterKeyHint="done" onSubmitEditing={submit} />
      <View style={{ marginTop: 16 }}>
        <InfoBox icon="key">A pessoa entra como colaborador com esta senha e pode trocá-la em Conta, Alterar senha.</InfoBox>
      </View>
      <View style={{ flex: 1, minHeight: 24 }} />
      <Button title="Cadastrar usuário" onPress={submit} loading={saving} style={{ marginBottom: 8 }} />
    </Screen>
  );
}
