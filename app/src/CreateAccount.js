import React from 'react';
import { TextInput, View, StyleSheet, Button } from 'react-native';

const grayRGB = 'rgb(211, 211, 211)';
class UsernameInput extends React.Component {
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

class PasswordInput extends React.Component {
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

export class CreateAccount extends React.Component {
    signUp = async () => {
        const currentUsernameInput = this.UsernameInput.current;
        const currentPasswordInput = this.PasswordInput.current;
        console.log('User sign-up request with ' +
                    currentUsernameInput.state.email + ' and ' +
                    currentPasswordInput.state.password);
    }
    
    constructor(props) {
        super(props);
        this.UsernameInput = React.createRef();
        this.PasswordInput = React.createRef();
    }
    
    render() {
        return (
            <View style={styles.container}>
                <UsernameInput ref={this.UsernameInput}/>
                <PasswordInput ref={this.PasswordInput}/>
                <Button
                    title='Sign Up'
                    onPress={this.signUp}
                />
            </View>
        )
    }
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
