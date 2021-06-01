import React from 'react';
import { cards } from '../../network/cards';
import { Text, View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import CardImage from './CardImage';
import {makeCancelable} from '../util/promise-helper'

/**
 * The Card module that houses the name and image.  Utilized in 'YourCards' for pressable buttons.
 * @param {*} navigation - navigation object used to move between different pages
 * @param {*} card - the card information data structure
 * @param {*} storeInformation - the data with the current store information
 * @param {String} origin - the origin of the navigation
 * @module Card
 */
export class Card extends React.Component {
    constructor(props) { 
        super(props);
        
        var cardInformation = props.card;

        // the state data for this card
        this.state = {
            name: "",
            cardImage: "Not an Empty String",
            showDefault: true,
            cardId: cardInformation.cardId,
            navigation: props.navigation,
            docId: cardInformation.docId,
            storeInformation: props.storeInformation,
            getCardImageURL: makeCancelable(cards.getCardImageURL(cardInformation.cardId)),
            getCardName: makeCancelable(cards.getCardName(cardInformation.cardId))
        }

        // get the card image url from cards
        this.state.getCardImageURL.promise.then(url => {
            this.setState({cardImage: url, showDefault: url.length == 0});
        }).catch(({isCanceled, ...error}) => {});
        // get the card name from cards
        this.state.getCardName.promise.then((cardName) => {
            this.setState({name: cardName});
        }).catch(({isCanceled, ...error}) => {});
    }

    componentWillUnmount() {
        this.state.getCardName.cancel();
        this.state.getCardImageURL.cancel();
    }

    // on press, navigate to the CardInfo page
    onPress = () => { 
        this.state.navigation.navigate('CardInfo', {
            cardId: this.state.cardId,
            docId: this.state.docId,
            storeInformation: this.state.storeInformation,
            img: this.state.showDefault ? require('../../../assets/cards/blank.png') : { uri: this.state.cardImage },
        })
    }

    render () {
        return (
            <View>
                <Text numberOfLines={1} style={styles.cardTitle}>{this.state.name}</Text>
                <TouchableOpacity activeOpacity={0.5} onPress={this.onPress}>
                    <CardImage
                        style={[ styles.card ]}
                        source={this.state.cardImage}
                        overlay={this.state.name}
                        default={this.state.showDefault}
                        cardId={this.state.cardId}
                    />
                </TouchableOpacity>
            </View>
        );
    }
}

// the stylesheet for this module
const styles = StyleSheet.create({
    card: {
        alignSelf: "center",
        width: (Dimensions.get('window').width * 0.9), // 90% of the device width
        height: (Dimensions.get('window').width * 0.9) / 1.586, // use a ratio to calculate height from the width
        marginBottom: 10 
    }, 
    cardTitle: {
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 10,
        fontSize: 20 
    }
});