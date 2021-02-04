import React from 'react';
import { TextInput, StyleSheet } from 'react-native';

const grayRGB = 'rgb(211, 211, 211)';
export class TextBox extends React.Component {
    constructor(props) { 
        super(props);

        this.state = {
            text: ''
        };

        this.placeholder = props.placeholder;
    }

    onChangeText = (val) => {
        this.setState({['text']: val});
    }

    render () {
        return (
            <TextInput
                style={styles.input}
                onChangeText={(text) => this.onChangeText(text)}
                placeholder={this.placeholder}
                placeholderTextColor={grayRGB}
            />
        );
    }
}

const styles = StyleSheet.create({
    input: {
        margin: 15,
        height: 40,
        width: '75%',
        borderColor: 'gray',
        borderWidth: 1
    },
  });
