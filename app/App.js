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

const Stack = createStackNavigator();

export default function App() {
  initializeAppBackend("firebase");

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={LoadingScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Login"
          component={Login}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="CreateAccount"
          component={CreateAccount}
          options={{headerShown: false}}
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
        options={{headerShown: false}}
        />
        <Stack.Screen
          name="AddCardManual"
          component={AddCardManual}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="AddCardCamera"
          component={AddCardCamera}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="PasswordReset"
          component={PasswordReset}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="AddCardDB"
          component={AddCardDB}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Permissions"
          component={AppPermissions}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="PrivacyPolicy"
          component={PrivacyPolicy}
          options={{headerShown: false}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
