import React from 'react';
import { TextInput, View, StyleSheet, Button } from 'react-native';
import mainStyles from '../styles/mainStyles';
import {UsernameInput, PasswordInput} from './LoginInput';
import {appBackend} from '../network/backend'

export const CreateAccount = props => {
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');

    async function signUp() {
        console.log('User sign-up request with ' +
                    username + ' and ' +
                    password);
        appBackend.signUp(username, password);
    }

    return (
        <View style={mainStyles.container}>
            <UsernameInput onChange={setUsername} />
            <PasswordInput onChange={setPassword} />
            <Button
                title='Sign Up'
                onPress={signUp}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    input: {
        margin: 15,
        height: 40,
        width: '75%',
        borderColor: '#7a42f4',
        borderWidth: 1
    },
  });
