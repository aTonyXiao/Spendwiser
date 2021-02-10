import React from 'react';
import { Text } from 'react-native'
import mainStyles from '../styles/mainStyles';
import {UsernameInput, PasswordInput} from './LoginInput';
import { View, StyleSheet, Button } from 'react-native';
import { appBackend } from '../network/backend'

export const Login = props => {
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    
    async function signIn() {
        console.log('User sign-in request with ' +
                    username + ' and ' +
                    password);

        appBackend.signIn(username, password);
    }

    return (
        <View style={mainStyles.container}>
            <UsernameInput onChange={setUsername} />
            <PasswordInput onChange={setPassword} />
            <Button
                title='Sign In'
                onPress={signIn}
            ></Button>
            <Button
                title="Sign in with Facebook"
                onPress={() => {
                    appBackend.signInWithFacebook();
                }}
            ></Button>
            <Button
                title="Don't have an account?"
                onPress={() => {
                    props.navigation.navigate('CreateAccount')
                }}
            ></Button>
        </View>
    )
}
