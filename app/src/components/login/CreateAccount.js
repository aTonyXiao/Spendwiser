import React from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Text } from 'react-native';
import mainStyles from '../../styles/mainStyles';
import {UsernameInput, PasswordInput} from './LoginInput';
import {appBackend} from '../../network/backend'

export const CreateAccount = props => {
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');

    async function signUp() {
        console.log('User sign-up request with ' +
                    username + ' and ' +
                    password);
        appBackend.signUp(username, password, (err) => {
            Alert.alert(
                "Unable to Create Account",
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
            <Text style={styles.title}>SpendWiser</Text>
            <UsernameInput onChange={setUsername} />
            <PasswordInput onChange={setPassword} />
            <TouchableOpacity style={styles.signUpWrapper} onPress={signUp}>
                <Text style={styles.signUpButton}>Sign Up</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    title : { 
        fontSize: 40,
        color: '#28b573',
        position: 'absolute',
        top: 130
    },
    signUpWrapper : {
        margin: 15,
        height: 40,
        width: '80%',
        borderColor: '#87CEFA',
        borderWidth: 1,
        backgroundColor: '#87CEFA',
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 25
    },
    signUpButton : { 
        color: 'white'
    }
})