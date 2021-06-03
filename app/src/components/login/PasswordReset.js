import React from 'react';
import { View, Image, Button, Alert, Dimensions, SafeAreaView, StyleSheet } from 'react-native';
import { UsernameInput } from './LoginInput';
import { appBackend } from '../../network/backend'
import { DismissKeyboard } from '../util/DismissKeyboard';
import { BackButtonHeader } from '../util/BackButtonHeader';

export const PasswordReset = props => {
    const [username, setUsername] = React.useState('');
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
                    <Button
                        title="Reset Password"
                        onPress={() => {
                            appBackend.resetPassword(username, (message) => {
                                Alert.alert(
                                    "",
                                    message,
                                    [
                                        { text: "OK" }
                                    ],
                                    { cancelable: false }
                                );
                            });
                        }}
                    ></Button>
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
        justifyContent: 'center',
        height: "100%"
    },
    registerContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        width: "100%",
        marginVertical: "25%"
    },
});