import { app } from 'firebase';
import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { appBackend } from '../../network/backend';

export class AddCardRow extends React.Component {
    constructor(props) { 
        super(props);

        var cardInformation = props.props.card
        this.state = {
            name: cardInformation.original_title,
            rewards: cardInformation.rewards,
            rewards_type: cardInformation.rewards_type,
            url: cardInformation.url
        }
        this.navigation = props.props.navigation;
    }

    saveCard = () => { 
        var user = "test"; // TODO temporary until login gives user id
        appBackend.dbAdd("users." + user + ".cards", {
            name: this.state.name,
            rewards: this.state.rewards,
            rewards_type: this.state.rewards_type,
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