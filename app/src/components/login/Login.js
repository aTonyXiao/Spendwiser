import React from 'react';
import mainStyles from '../../styles/mainStyles';
import {UsernameInput, PasswordInput} from './LoginInput';
import { View, StyleSheet, Button, Alert } from 'react-native';
import { appBackend } from '../../network/backend'

export const Login = props => {
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    
    async function signIn() {
        console.log('User sign-in request with ' +
                    username + ' and ' +
                    password);

        appBackend.signIn(username, password, (err)=> {
            Alert.alert(
                "Unable to Login",
                err,
                [
                    { text: "OK", onPress: () => console.log("OK Pressed") }
                ],
                { cancelable: false }
            );
        });
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
                title='Reset Password'
                onPress={() => {
                    props.navigation.navigate('PasswordReset');
                }}
            ></Button>
            <Button
                title="Don't have an account?"
                onPress={() => {
                    props.navigation.navigate('CreateAccount')
                }}
            ></Button>
            <Button
                title="Sign in with Facebook"
                onPress={() => {
                    let loginProviders = appBackend.getLoginProviders();
                    loginProviders.facebook.login();
                }}
            ></Button>
            <Button
            title="Sign in with Google"
                onPress={() => {
                    let loginProviders = appBackend.getLoginProviders();
                    loginProviders.google.login();
                }}
            ></Button>
        </View>
    )
}
