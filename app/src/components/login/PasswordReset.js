import React from 'react';
import { View, StyleSheet, Button, Alert } from 'react-native';
import { UsernameInput } from './LoginInput';
import mainStyles from '../../styles/mainStyles';
import { appBackend } from '../../network/backend'

export const PasswordReset = props => {
    const [username, setUsername] = React.useState('');
    return (
        <View style={mainStyles.container}>
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
    );
}
