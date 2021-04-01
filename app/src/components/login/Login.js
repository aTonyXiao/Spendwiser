import React from 'react';
import mainStyles from '../../styles/mainStyles';
import { UsernameInput, PasswordInput } from './LoginInput';
import { View, StyleSheet, Button, Alert, TouchableOpacity, Text } from 'react-native';
import { appBackend } from '../../network/backend';

export const Login = props => {
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [displayErrorText, setDisplayErrorText] = React.useState(false);
    
    async function signIn() {
        if (!username || !password) { 
            setDisplayErrorText(true);

            setTimeout(function() { 
                setDisplayErrorText(false);
            }, 2000);
        } else {
            console.log('User sign-in request with ' +
                username + ' and ' +
                password);

            appBackend.signIn(username, password, (err) => {
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
    }

    return (
        <View style={mainStyles.container}>
            <Text style={mainStyles.large_title}>SpendWiser</Text>

            {
                displayErrorText &&
                <Text style={{color:'red'}}>Please input a username and a password</Text>
            }
            <UsernameInput onChange={setUsername} />
            <PasswordInput onChange={setPassword} />
            <TouchableOpacity 
                style={styles.forgotPasswordButton}
                onPress={() => props.navigation.navigate('PasswordReset')}>
                <Text style={styles.forgotPasswordButton}>
                    Forgot your password?
                </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.loginWrapper} onPress={signIn}>
                <Text style={styles.loginButton}>Log In</Text>
            </TouchableOpacity>

            <View style={styles.line}/>

            <Button
                color={'dodgerblue'}
                title="Sign in with Facebook"
                onPress={() => {
                    let loginProviders = appBackend.getLoginProviders();
                    loginProviders.facebook.login();
                }}
            ></Button>
            <Button
                color={'dodgerblue'}
                title="Sign in with Google"
                onPress={() => {
                    let loginProviders = appBackend.getLoginProviders();
                    loginProviders.google.login();
                }}
            ></Button>

            <TouchableOpacity
                style={styles.signUpWrapper}
                onPress={() => props.navigation.navigate('CreateAccount')}>
                <Text style={styles.signUpButton}>
                    New user? Make an account here
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.offlineAccountWrapper}
                onPress={() => {
                    console.log("Signing in with an offline account...");
                }}>
                <Text style={styles.signUpButton}>
                    Use an offline account
                </Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    loginWrapper : {
        margin: 15,
        height: 40,
        width: '80%',
        borderColor: '#87CEFA',
        borderWidth: 1,
        backgroundColor: '#87CEFA',
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center'
    },
    loginButton : { 
        color: 'white'
    },
    forgotPasswordButton : {
        color: 'dodgerblue',
        left: '10%'
    },
    line: {
        width: '80%',
        borderBottomColor: 'lightgray',
        borderBottomWidth: 1,
        margin: 15
    }, 
    signUpButton: { 
        color: 'dodgerblue'
    }, 
    signUpWrapper: { 
        position: 'absolute',
        bottom: 45,
    },
    offlineAccountWrapper: {
        position: 'absolute',
        bottom: 20,
    }
})

const loginWrapper = function(password) { 
    const allowLogin = false;
    if (password != '') { 

    }

    return {
        margin: 15,
        height: 40,
        width: '80%',
        borderColor: '#87CEFA',
        borderWidth: 1,
        backgroundColor: '#87CEFA',
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center'
    }
} 
