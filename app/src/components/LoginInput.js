import React from 'react';
import { TextInput, View, StyleSheet, Button } from 'react-native';
import mainStyles from '../styles/mainStyles';

const grayRGB = 'rgb(211, 211, 211)';
export const UsernameInput = props => {
    async function onChangeEmail(val) {
        props.onChange(val);
    }

    return (
        <TextInput
            style={styles.input}
            onChangeText={text => onChangeEmail(text)}
            placeholder={'Username'}
            placeholderTextColor={grayRGB}
            textContentType={'emailAddress'}
        />
    );
}

export const PasswordInput = props => {
    async function onChangePassword(val) {
        props.onChange(val);
    }

    return (
        <TextInput
            style={styles.input}
            onChangeText={val => onChangePassword(val)}
            placeholder={'Password'}
            placeholderTextColor={grayRGB}
            textContentType={'newPassword'}
            secureTextEntry={true}
        />
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
