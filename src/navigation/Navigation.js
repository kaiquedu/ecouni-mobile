import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Touchable } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { colors, fonts } from '../theme';

import Splash from '../screens/auth/Splash';
import Login from '../screens/auth/Login';
import { NovaSenha, RecuperarCodigo, RecuperarEmail, SenhaAtualizada } from '../screens/auth/RecuperarSenha';
import Inicio from '../screens/coletas/Inicio';
import Historico from '../screens/coletas/Historico';
import RegistrarColeta from '../screens/coletas/RegistrarColeta';
import EditarColeta from '../screens/coletas/EditarColeta';
import Relatorios from '../screens/relatorios/Relatorios';
import ExportarPdf from '../screens/relatorios/ExportarPdf';
import Conta from '../screens/conta/Conta';
import DadosPessoais from '../screens/conta/DadosPessoais';
import AlterarSenha from '../screens/conta/AlterarSenha';
import NovoUsuario from '../screens/conta/NovoUsuario';
import Ajuda from '../screens/suporte/Ajuda';
import FaleConosco from '../screens/suporte/FaleConosco';
import TermosPrivacidade from '../screens/suporte/TermosPrivacidade';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const theme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: colors.white, primary: colors.navy } };

const TAB_ICONS = { Inicio: 'home', Historico: 'clock', AjudaTab: 'help-circle', Relatorios: 'bar-chart-2', Conta: 'user' };
const TAB_LABELS = { Inicio: 'Início', Historico: 'Histórico', AjudaTab: 'Ajuda', Relatorios: 'Relatórios', Conta: 'Conta' };

function TabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 8) }]} accessibilityRole="tablist">
      {state.routes.map((route, i) => {
        const focused = state.index === i;
        const color = focused ? colors.navy : colors.placeholder;
        return (
          <Touchable
            key={route.key}
            onPress={() => {
              const e = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!focused && !e.defaultPrevented) navigation.navigate(route.name);
            }}
            style={styles.tab}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={TAB_LABELS[route.name]}
          >
            <Feather name={TAB_ICONS[route.name]} size={24} color={color} />
            <Text style={[styles.tabLabel, { color }, focused && { fontFamily: fonts.extrabold }]}>{TAB_LABELS[route.name]}</Text>
          </Touchable>
        );
      })}
    </View>
  );
}

function MainTabs() {
  const { user } = useAuth();
  return (
    <Tab.Navigator tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Inicio" component={Inicio} />
      <Tab.Screen name="Historico" component={Historico} />
      {user?.IsAdmin ? <Tab.Screen name="Relatorios" component={Relatorios} /> : <Tab.Screen name="AjudaTab" component={Ajuda} />}
      <Tab.Screen name="Conta" component={Conta} />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  const { user } = useAuth();
  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: colors.white },
          ...TransitionPresets.SlideFromRightIOS,
          gestureEnabled: true,
        }}
      >
        {user ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="RegistrarColeta" component={RegistrarColeta} options={TransitionPresets.ModalSlideFromBottomIOS} />
            <Stack.Screen name="EditarColeta" component={EditarColeta} />
            <Stack.Screen name="ExportarPdf" component={ExportarPdf} options={TransitionPresets.ModalSlideFromBottomIOS} />
            <Stack.Screen name="DadosPessoais" component={DadosPessoais} />
            <Stack.Screen name="AlterarSenha" component={AlterarSenha} />
            <Stack.Screen name="NovoUsuario" component={NovoUsuario} options={TransitionPresets.ModalSlideFromBottomIOS} />
            <Stack.Screen name="Ajuda" component={Ajuda} />
          </>
        ) : (
          <>
            <Stack.Screen name="Splash" component={Splash} options={{ animationEnabled: false }} />
            <Stack.Screen name="Login" component={Login} options={{ animationEnabled: false }} />
            <Stack.Screen name="RecuperarEmail" component={RecuperarEmail} />
            <Stack.Screen name="RecuperarCodigo" component={RecuperarCodigo} />
            <Stack.Screen name="NovaSenha" component={NovaSenha} />
            <Stack.Screen name="SenhaAtualizada" component={SenhaAtualizada} />
          </>
        )}
        <Stack.Screen name="FaleConosco" component={FaleConosco} />
        <Stack.Screen name="TermosPrivacidade" component={TermosPrivacidade} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: { flexDirection: 'row', backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: '#EDF1F4', paddingTop: 8 },
  tab: { flex: 1, minHeight: 52, alignItems: 'center', justifyContent: 'center', gap: 3 },
  tabLabel: { fontFamily: fonts.semibold, fontSize: 12 },
});
