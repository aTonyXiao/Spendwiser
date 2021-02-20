import React from 'react';
import { TextInput, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
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

export const UsernameInput = props => {
    return (
        <TextInput
            style={styles.input}
            onChangeText={text => props.onChange(text)}
            placeholder={' Username'}
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
            placeholder={' Password'}
            placeholderTextColor={grayRGB}
            textContentType={'newPassword'}
            secureTextEntry={true}
        />
    );
}