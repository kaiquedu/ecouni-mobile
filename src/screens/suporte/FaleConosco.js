import React, { useState } from 'react';
import { Linking, Text, View } from 'react-native';
import { Button, Chip, ChipRow, Label, Screen, TextField, TopBar } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { SUPPORT_EMAIL } from '../../config';
import { colors, type } from '../../theme';

const SUBJECTS = ['Dúvida', 'Problema no app', 'Sugestão', 'Outro'];
const MAX = 1000;

export default function FaleConosco({ navigation, route }) {
  const { user } = useAuth();
  const toast = useToast();
  const [assunto, setAssunto] = useState(route.params?.assunto || 'Dúvida');
  const [mensagem, setMensagem] = useState('');
  const [error, setError] = useState('');

  const send = async () => {
    if (mensagem.trim().length < 10) return setError('Escreva pelo menos 10 caracteres para a equipe entender o pedido.');
    const assinatura = user ? `\n\n--\n${user.Nome} (${user.Email})` : '';
    const url = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`[EcoUni] ${assunto}`)}&body=${encodeURIComponent(mensagem.trim() + assinatura)}`;
    try {
      await Linking.openURL(url);
      navigation.goBack();
    } catch {
      toast(`Nenhum app de e-mail encontrado. Escreva para ${SUPPORT_EMAIL}.`, 'error');
    }
  };

  return (
    <Screen scroll keyboard edges={['top', 'bottom']}>
      <TopBar title="Fale conosco" onBack={navigation.goBack} />
      <Text style={[type.body, { color: colors.muted }]}>{user ? 'A resposta chega no seu e-mail cadastrado.' : `A mensagem vai para ${SUPPORT_EMAIL}.`}</Text>

      <Label>Assunto</Label>
      <ChipRow>
        {SUBJECTS.map((s) => (
          <Chip key={s} label={s} selected={assunto === s} onPress={() => setAssunto(s)} />
        ))}
      </ChipRow>

      <TextField
        label="Mensagem"
        placeholder="Conte o que aconteceu ou o que podemos melhorar"
        multiline
        value={mensagem}
        onChangeText={(v) => {
          setMensagem(v.slice(0, MAX));
          if (error) setError('');
        }}
        error={error}
        maxLength={MAX}
      />
      <Text style={[type.small, { textAlign: 'right', marginTop: 6 }]}>
        {mensagem.length}/{MAX}
      </Text>

      <View style={{ flex: 1, minHeight: 24 }} />
      <Button title="Enviar mensagem" icon="send" onPress={send} style={{ marginBottom: 8 }} />
    </Screen>
  );
}
