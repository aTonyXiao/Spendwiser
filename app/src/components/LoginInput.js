import React from 'react';
import { TextInput, View, StyleSheet, Button } from 'react-native';
import mainStyles from '../styles/mainStyles';

const grayRGB = 'rgb(211, 211, 211)';
export const UsernameInput = props => {
    return (
        <TextInput
            style={styles.input}
            onChangeText={text => props.onChange(text)}
            placeholder={'Username'}
            placeholderTextColor={grayRGB}
            textContentType={'emailAddress'}
        />
    );
}

export const PasswordInput = props => {
    return (
        <TextInput
            style={styles.input}
            onChangeText={text => props.onChange(text)}
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
