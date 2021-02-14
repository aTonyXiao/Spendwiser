import { app } from 'firebase';
import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { appBackend } from '../../network/backend';
import { user } from '../../network/backend';

export class AddCardRow extends React.Component {
    constructor(props) { 
        super(props);

        var cardInformation = props.props.card
        this.state = {
            name: cardInformation.original_title,
            rewards: cardInformation.rewards,
            url: cardInformation.url
        }
        this.navigation = props.props.navigation;
    }

    saveCard = () => { 
        var userId = user.getUserId(); // TODO for some reason this is undefined
        // var userId = "test";
        appBackend.dbAdd("users." + userId + ".cards", {
            name: this.state.name,
            rewards: this.state.rewards,
            url: this.state.url
        }, (id) => { 
            console.log(id);
        })

        this.navigation.navigate('Cards');
    } 

    render () {
        return (
            <View>
                <TouchableOpacity
                    style={styles.button}
                    onPress={this.saveCard}
                >
                    <Text>{this.state.name}</Text>
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