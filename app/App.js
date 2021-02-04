import * as firebase from 'firebase';
import React from 'react';

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

  // eventually replace w/ : https://github.com/dwyl/learn-json-web-tokens
  const firebaseConfig = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    databaseURL: process.env.DATABASE_URL,
    projectId: process.env.PROJECT_ID,
    // storageBucket: process.env.STORAGE_BUCKET,
    // messagingSenderId: process.env.MESSAGING_SENDER_ID,
    // appId: process.env.APP_ID,
    // measurementId: process.env.MEASUREMENT_ID,
  };
  
  firebase.initializeApp(firebaseConfig);

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