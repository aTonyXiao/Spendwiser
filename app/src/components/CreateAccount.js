import React from 'react';
import { TextInput, View, StyleSheet, Button } from 'react-native';
import mainStyles from '../styles/mainStyles';
import {UsernameInput, PasswordInput} from './LoginInput';

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
            <View style={mainStyles.container}>
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
    input: {
        margin: 15,
        height: 40,
        width: '75%',
        borderColor: '#7a42f4',
        borderWidth: 1
    },
  });
