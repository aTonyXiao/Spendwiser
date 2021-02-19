import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { cards } from '../../network/cards';

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
        this.CardImage = require("../../../assets/cards/blank.png");

        this.state = {
            name: ""
        }

        var cardInformation = props.props.card;
        this.cardId = cardInformation.cardId;
        this.navigation = props.props.navigation;

        cards.getCardImageURL(this.cardId).then((url) => {
            this.state.CardImage = url;
            //this.setState(, url);
            this.forceUpdate();
            console.log(url);
        });

        cards.getCardName(this.cardId).then((cardName) => {
            this.state.name = cardName;
        });
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
                        source={{
                            source: "../../../assets/cards/blank.png",
                            uri: this.state.CardImage,
                        }}
                        style={styles.card}
                    />
                </TouchableOpacity>
            </View>
        );
    }
}