import React from 'react';
import { initializeAppBackend } from './src/network/backend';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { LoadingScreen } from './src/components/LoadingScreen';
import { Login } from './src/components/login/Login';
import { CreateAccount } from './src/components/login/CreateAccount';
import { Settings } from './src/components/Settings';
import { YourCards } from './src/components/cards/YourCards';
import { DisplayCard } from './src/components/cards/DisplayCard';
import { MainScreen } from './src/components/main/MainScreen';
import { AddCardManual } from './src/components/addCard/AddCardManual';
import { AddCardCamera } from './src/components/addCard/AddCardCamera';
import { PasswordReset } from './src/components/login/PasswordReset';
import { AddCardDB } from './src/components/addCard/AddCardDB';
import { AppPermissions } from './src/components/Permissions';
import { PrivacyPolicy } from './src/components/PrivacyPolicy';
import { Account } from './src/components/Account';

const Stack = createStackNavigator();

export default function App() {
  initializeAppBackend("firebase");

  return (
    <NavigationContainer>
      <Stack.Navigator>
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
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="YourCards"
          component={YourCards}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="CardInfo"
          component={DisplayCard}
          options={{headerShown: false}}
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
          name="Account"
          component={Account}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
