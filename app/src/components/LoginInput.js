import React from 'react';
import { TextInput, View, StyleSheet, Button } from 'react-native';
import mainStyles from '../styles/mainStyles';

const grayRGB = 'rgb(211, 211, 211)';
export class UsernameInput extends React.Component {
    state = {
        email: ''
    };

    onChangeEmail = (val) => {
        this.setState({['email']: val});
    }

    render () {
        return (
            <TextInput
                style={styles.input}
                onChangeText={text => this.onChangeEmail(text)}
                placeholder={'Username'}
                placeholderTextColor={grayRGB}
                textContentType={'emailAddress'}
            />
        );
    }
}

export class PasswordInput extends React.Component {
    state = {
        password: ''
    };

    onChangePassword = (val) => {
        this.setState({['password']: val});
    }

    render() {
        return (
            <TextInput
                style={styles.input}
                onChangeText={val => this.onChangePassword(val)}
                placeholder={'Password'}
                placeholderTextColor={grayRGB}
                textContentType={'newPassword'}
                secureTextEntry={true}
            />
        );
    }
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
