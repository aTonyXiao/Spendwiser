import React from 'react';
import { Text } from 'react-native'
import mainStyles from '../styles/mainStyles';
import {UsernameInput, PasswordInput} from './LoginInput';
import { View, StyleSheet, Button } from 'react-native';

export class Login extends React.Component {
    login = async () => {
        const currentUsernameInput = this.UsernameInput.current;
        const currentPasswordInput = this.PasswordInput.current;
        console.log('User login request with ' +
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
            <View style={mainStyles.container}>
                <UsernameInput ref={this.UsernameInput}/>
                <PasswordInput ref={this.PasswordInput}/>
                <Button
                    title='Login'
                    onPress={this.login}
                />
            </View>
        )
    }
}
