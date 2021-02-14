import React from 'react';
import { initializeAppBackend } from './src/network/backend';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen } from './src/components/HomeScreen';
import { Login } from './src/components/login/Login';
import { CreateAccount } from './src/components/login/CreateAccount';
import { Settings } from './src/components/Settings';
import { Cards } from './src/components/cards/Cards';
import { DisplayCard } from './src/components/cards/DisplayCard';
import { MainScreen } from './src/components/MainScreen';
import { AddCard } from './src/components/addCard/AddCard';
import { AddCardManual } from './src/components/addCard/AddCardManual';
import { AddCardSearch } from './src/components/addCard/AddCardSearch';
import { AddCardCamera } from './src/components/addCard/AddCardCamera';

const Stack = createStackNavigator();

export default function App() {
  initializeAppBackend("firebase");

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
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
          name="Cards"
          component={Cards}
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
          name="AddCard"
          component={AddCard}
        />
        <Stack.Screen
          name="AddCardSearch"
          component={AddCardSearch}
        />
        <Stack.Screen
          name="AddCardManual"
          component={AddCardManual}
        />
        <Stack.Screen
          name="AddCardCamera"
          component={AddCardCamera}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
