import React from 'react';
import { View, Button } from 'react-native';
import mainStyles from '../styles/mainStyles';

export function Settings() { 
    return(
        <View style={mainStyles.container}>
            <Button
                title="Tell a Friend!"
                // onPress={() => navigation.navigate('Login')}
            ></Button>
            <Button
                title="Notifications"
                // onPress={() => navigation.navigate('CreateAccount')}
            ></Button>
            <Button
                title="Privacy"
                // onPress={() => navigation.navigate('CreateAccount')}
            ></Button>
            <Button
                title="Account"
                // onPress={() => navigation.navigate('CreateAccount')}
            ></Button>
            <Button
                title="Help"
                // onPress={() => navigation.navigate('CreateAccount')}
            ></Button>
            <Button
                title="About"
                // onPress={() => navigation.navigate('CreateAccount')}
            ></Button>
        </View>
    );
}