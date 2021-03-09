import React from 'react';
import { initializeAppBackend } from './src/network/backend';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { LoadingScreen } from './src/components/LoadingScreen';
import { Login } from './src/components/login/Login';
import { CreateAccount } from './src/components/login/CreateAccount';
import { Settings } from './src/components/settings/Settings';
import { YourCards } from './src/components/cards/YourCards';
import { DisplayCard } from './src/components/cards/DisplayCard';
import { MainScreen } from './src/components/main/MainScreen';
import { AddCardManual } from './src/components/addCard/AddCardManual';
import { AddCardCamera } from './src/components/addCard/AddCardCamera';
import { PasswordReset } from './src/components/login/PasswordReset';
import { AddCardDB } from './src/components/addCard/AddCardDB';
import { AppPermissions } from './src/components/settings/Permissions';
import { PrivacyPolicy } from './src/components/settings/PrivacyPolicy';
import { Account } from './src/components/settings/Account';
import { About } from './src/components/settings/About';

const Stack = createStackNavigator();

export default function App() {
  initializeAppBackend("firebase");

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{headerShown: false}}
      >
        <Stack.Screen
          name="Home"
          component={LoadingScreen}
        />
        <Stack.Screen
          name="Login"
          component={Login}
        />
        <Stack.Screen
          name="CreateAccount"
          component={CreateAccount}
        />
        <Stack.Screen
          name="Main"
          component={MainScreen}
        />
        <Stack.Screen
          name="YourCards"
          component={YourCards}
        />
        <Stack.Screen
          name="CardInfo"
          component={DisplayCard}
        />
        <Stack.Screen
        name="Settings"
        component={Settings}
        />
        <Stack.Screen
          name="AddCardManual"
          component={AddCardManual}
        />
        <Stack.Screen
          name="AddCardCamera"
          component={AddCardCamera}
        />
        <Stack.Screen
          name="PasswordReset"
          component={PasswordReset}
        />
        <Stack.Screen
          name="AddCardDB"
          component={AddCardDB}
        />
        <Stack.Screen
          name="Permissions"
          component={AppPermissions}
        />
        <Stack.Screen
          name="PrivacyPolicy"
          component={PrivacyPolicy}
        />
        <Stack.Screen
          name="About"
          component={About}
        />
        <Stack.Screen
          name="Account"
          component={Account}
          options={{headerShown: false}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
