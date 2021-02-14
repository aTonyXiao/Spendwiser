import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { appBackend } from '../../network/backend';
import { user } from '../../network/user';

const styles = StyleSheet.create({
    scrollView: {
        width: "95%"
    },
    card: {
        resizeMode: "contain",
        width: "100%",
        height: 230, // hard coded for now
        marginBottom: 10,
    }, 
    cardTitle: {
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 0,
        fontSize: 20 
    }
});

export class Card extends React.Component {
    constructor(props) { 
        super(props);

        // can find a better way of loading in assets
        // this for a proof of concept for now
        this.CardImage = require("../../../assets/cards/blank.png")

        var cardInformation = props.props.card
        this.state = {
            name: cardInformation.name,
            rewards: cardInformation.rewards,
            url: cardInformation.url
        }
        this.navigation = props.props.navigation;

        var userId = user.getUserId();
        appBackend.dbGet("users." + userId + ".cards", ["name", "==", cardInformation.name], (data) => {
            this.cardId = data.id;
        })
    }

    onPress = () => { 
        this.navigation.navigate('CardInfo', {
            cardId: this.cardId
        })
    }

    render () {
        return (
            <View>
                <Text style={styles.cardTitle}>{this.state.name}</Text>
                <TouchableOpacity activeOpacity={0.5} onPress={this.onPress}>
                    <Image
                        source={this.CardImage}
                        style={styles.card}
                    />
                </TouchableOpacity>
            </View>
        );
    }
}