import React from 'react';
import { initializeAppBackend, appBackend } from './src/network/backend';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen } from './src/components/HomeScreen';
import { Login } from './src/components/Login';
import { CreateAccount } from './src/components/CreateAccount';
import { Settings } from './src/components/Settings';
import { Cards } from './src/components/Cards';
import { AddCard } from './src/components/AddCard';

const Stack = createStackNavigator();

export default function App() {
  initializeAppBackend("firebase");

  // appBackend.dbGet("experimental.exp2", (data) => {
  //   console.log(data);
  // });
  
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
          name="Cards"
          component={Cards}
        />
        <Stack.Screen
          name="AddCard"
          component={AddCard}
        />
        <Stack.Screen
        name="Settings"
        component={Settings}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}