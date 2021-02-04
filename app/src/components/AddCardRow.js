import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';

export class AddCardRow extends React.Component {
    constructor(props) { 
        super(props);

        var cardInformation = props.props

        this.state = {
            cardName: cardInformation.original_title
        }
    }

    onPress = () => { 
        console.log('press');
    } 

    render () {
        return (
            <View>
                <TouchableOpacity
                    style={styles.button}
                    onPress={this.onPress}
                >
                    <Text>{this.state.cardName}</Text>
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    button: {
        color: 'black',
        textAlign: 'left',
    },
  })