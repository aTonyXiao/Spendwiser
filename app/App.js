import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen } from './src/components/HomeScreen';
import { Login } from './src/components/Login';
import { CreateAccount } from './src/components/CreateAccount';
import { Cards } from './src/components/Cards';

const Stack = createStackNavigator();

export default function App() {
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}