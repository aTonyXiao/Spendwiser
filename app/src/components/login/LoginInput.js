import React, { useState } from 'react';
import { TextInput, StyleSheet } from 'react-native';


export const UsernameInput = (props) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <TextInput
            style={isFocused ? styles.focusedInput : styles.unfocusedInput}
            onChangeText={text => props.onChange(text)}
            placeholder={' Email Address'}
            placeholderTextColor={grayRGB}
            textContentType={'emailAddress'}
            onFocus={() => setIsFocused(true)}
            onEndEditing={() => setIsFocused(false)}
        />
    );
}

export const PasswordInput = props => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <TextInput
            style={isFocused ? styles.focusedInput : styles.unfocusedInput}
            onChangeText={text => props.onChange(text)}
            placeholder={' Password'}
            placeholderTextColor={grayRGB}
            textContentType={'newPassword'}
            secureTextEntry={true}
            onFocus={() => setIsFocused(true)}
            onEndEditing={() => setIsFocused(false)}
        />
    );
}

const styles = StyleSheet.create({
    focusedInput: {
        margin: 15,
        height: 40,
        width: '80%',
        borderColor: 'blue',
        borderWidth: 1,
        backgroundColor: '#F0F0F0',
        borderRadius: 5,
        marginTop: 8,
        marginBottom: 8,
        padding: 10
    },
    unfocusedInput: {
        margin: 15,
        height: 40,
        width: '80%',
        borderColor: '#F0F0F0',
        borderWidth: 1,
        backgroundColor: '#F0F0F0',
        borderRadius: 5,
        marginTop: 8,
        marginBottom: 8,
        padding: 10
    },
});
const grayRGB = 'rgb(192, 192, 192)';