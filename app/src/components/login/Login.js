import React, { useEffect } from 'react';
import { UsernameInput, PasswordInput } from './LoginInput';
import { View, StyleSheet, Alert, TouchableOpacity, Text, Image, Dimensions } from 'react-native';
import { appBackend } from '../../network/backend';
import { DismissKeyboard } from '../util/DismissKeyboard';
import { Ionicons } from '@expo/vector-icons'
import { isAvailableAsync } from "expo-apple-authentication";
import { SafeAreaView } from 'react-native-safe-area-context';

export const Login = props => {
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [isAppleAvail, setAppleAvail] = React.useState(null);
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

    

    useEffect(() => {
        async function getAppleLoginAvailability () {
            const isAppleLoginAvailable = await isAvailableAsync();
            setAppleAvail(isAppleLoginAvailable);
        }
        if (isAppleAvail === null) getAppleLoginAvailability();
    }, []);

    return (
        <DismissKeyboard>
            <SafeAreaView style={styles.screen}>
                <View style={{marginTop: "25%"}}>
                    <Image source = {require("../../../assets/spendwiser_logo.png")}
                        style = {{ 
                            width: Dimensions.get('window').width * .8,  //its same to '20%' of device width
                            aspectRatio: 5, // <-- this
                            resizeMode: 'contain', //optional
                        }}
                    />
                </View>

                <View style={styles.loginContainer}>
                    {
                        displayErrorText ?
                        (<Text style={{ color: 'red' }}>Please input a username and a password</Text>) :
                        (<Text> </Text>)
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

                    <View style={styles.line} />

                    <View style={styles.logosContainer}>
                        <TouchableOpacity
                            onPress={() => {
                                let loginProviders = appBackend.getLoginProviders();
                                loginProviders.facebook.login();
                            }}
                            style={styles.logo}
                        >
                            <Ionicons
                                name="logo-facebook"
                                color="dodgerblue"
                                size={32}
                            ></Ionicons>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => {
                                let loginProviders = appBackend.getLoginProviders();
                                loginProviders.google.login();
                            }}
                            style={styles.logo}
                        >
                            <Ionicons
                                name="logo-google"
                                color="#DB4437"
                                size={32}
                            ></Ionicons>
                        </TouchableOpacity>

                        {isAppleAvail === true ? (
                        <TouchableOpacity
                            onPress={() => {
                                let loginProviders = appBackend.getLoginProviders();
                                loginProviders.apple.login();
                            }}
                            style={styles.logoApple}
                        >
                            <Ionicons
                                name="logo-apple"
                                color="white"
                                size={16}
                            ></Ionicons>
                        </TouchableOpacity>) : null}
                    </View>
                </View>

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
                        appBackend.signInOffline();
                    }}>
                    <Text style={styles.signUpButton}>
                        Continue without logging in
                </Text>
                </TouchableOpacity>
            </SafeAreaView>
        </DismissKeyboard>
    )
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: "100%"
    },
    loginContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: "100%",
    },
    logosContainer: {
        display: 'flex', 
        flexDirection: 'row',
    },
    logo: {
        margin: 15,
        marginTop: 0,
    },
    logoApple: {
        // normal stuff
        margin: 15,
        marginTop: 0,
        // button design stuff
        width: 32,
        height: 32,
        paddingBottom: 1,
        borderRadius: 100,
        alignItems:'center',
        justifyContent:'center',
        backgroundColor: "black"
    },
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
        marginTop: "25%",
        bottom: 30,
    },
    offlineAccountWrapper: {
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
