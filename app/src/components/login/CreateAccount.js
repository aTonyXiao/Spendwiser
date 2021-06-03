import React , { useState } from 'react';
import { 
    View, 
    StyleSheet, 
    Alert, 
    TouchableOpacity, 
    Text,
    Image,
    Dimensions
} from 'react-native';
import { UsernameInput, PasswordInput } from './LoginInput';
import { appBackend } from '../../network/backend'
import { DismissKeyboard } from '../util/DismissKeyboard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackButtonHeader } from '../util/BackButtonHeader';

export const CreateAccount = props => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [secondPassword, setSecondPassword] = useState('');
    const [showPasswordsDontMatch, setShowPasswordsDontMatch] = useState(false);

    async function signUp() {
        if (password != secondPassword) {
            setShowPasswordsDontMatch(true);
            setTimeout(function() { 
                setShowPasswordsDontMatch(false);
            }, 2500);
        } else {
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
    }

    return (
        <DismissKeyboard>
            <SafeAreaView style={styles.screen}>
                <BackButtonHeader navigation={props.navigation}/>
                <View style={{marginTop: "25%"}}>
                    <Image source = {require("../../../assets/spendwiser_logo.png")}
                        style = {{ 
                            width: Dimensions.get('window').width * .8,  //its same to '20%' of device width
                            aspectRatio: 5, // <-- this
                            resizeMode: 'contain', //optional
                        }}
                    />
                </View>
                <View style={styles.registerContainer}>
                    <UsernameInput onChange={setUsername} />
                    {
                        showPasswordsDontMatch &&
                        <Text style={styles.errorText}>Passwords must match</Text>
                    }
                    <PasswordInput onChange={setPassword} />
                    <PasswordInput onChange={setSecondPassword} confirm={true} />
                    <TouchableOpacity style={styles.signUpWrapper} onPress={signUp}>
                        <Text style={styles.signUpButton}>Sign Up</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </DismissKeyboard>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: "100%"
    },
    registerContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: "100%",
        marginBottom: "25%"
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
    },
    errorText: {
        color: 'red'
    },
    input: {
        margin: 15,
        height: 40,
        width: '80%',
        borderColor: '#F0F0F0',
        borderWidth: 1,
        backgroundColor: '#F0F0F0',
        borderRadius: 5,
        marginTop: 8,
        marginBottom: 8 
    },
});
