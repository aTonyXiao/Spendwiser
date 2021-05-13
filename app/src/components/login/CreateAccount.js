import React , { useState } from 'react';
import { 
    View, 
    StyleSheet, 
    Alert, 
    TouchableOpacity, 
    Text,
    TextInput
} from 'react-native';
import mainStyles from '../../styles/mainStyles';
import { UsernameInput, PasswordInput } from './LoginInput';
import { appBackend } from '../../network/backend'

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
        <View style={mainStyles.container}>
            <Text style={styles.title}>SpendWiser</Text>
            <UsernameInput onChange={setUsername} />
            {
                showPasswordsDontMatch &&
                <Text style={styles.errorText}>Passwords must match</Text>
            }
            <PasswordInput onChange={setPassword} />
            <TextInput
                style={styles.input}
                onChangeText={(text) => setSecondPassword(text)}
                placeholder={' Password'}
                placeholderTextColor={grayRGB}
            />
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
const grayRGB = 'rgb(192, 192, 192)';