import React from 'react';
import { TextInput, View, StyleSheet, Button } from 'react-native';

const UsernameInput = () => {
    const [value, onChangeText] = React.useState('');
    const grayRGB = 'rgb(211, 211, 211)';
    return (
        <TextInput
            style={styles.input}
            onChangeText={text => onChangeText(text)}
            value={value}
            placeholder={'Username'}
            placeholderTextColor={grayRGB}
            textContentType={'emailAddress'}
        />
    );
}

const PasswordInput = () => {
    const [value, onChangeText] = React.useState('');
    const grayRGB = 'rgb(211, 211, 211)';
    return (
        <TextInput
            style={styles.input}
            onChangeText={text => onChangeText(text)}
            value={value}
            placeholder={'Password'}
            placeholderTextColor={grayRGB}
            textContentType={'newPassword'}
            secureTextEntry={true}
        />
    );
}

const SubmitButton = () => {
    return (
        <Button
            title="Sign Up"
            color='#841584'
        />
    );
}

export const CreateAccount = (props) => { 
    return (
        <View style={styles.container}>
            <UsernameInput/>
            <PasswordInput/>
            <SubmitButton/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    input: {
        margin: 15,
        height: 40,
        width: '75%',
        borderColor: '#7a42f4',
        borderWidth: 1
    },
  });
