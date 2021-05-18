import React from 'react';
import { TextInput, StyleSheet } from 'react-native';

/**
 * TextBox util component - a simple textbox 
 * 
 * TODO add parameters for documentation
 */
const grayRGB = 'rgb(211, 211, 211)';
export class TextBox extends React.Component {
    constructor(props) { 
        super(props);

        this.state = {
            text: ''
        };

        this.placeholder = props.placeholder;

        this.useStyle = false;
        if (props.style) { 
            this.useStyle = true;
            this.style = props.style;
        }
    }

    onChangeText = (val) => {
        this.setState({['text']: val});
    }

    render () {
        return (
            <TextInput
                style={this.useStyle ? this.style : styles.input}
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
        borderWidth: 1,
        padding: 10
    },
  });
