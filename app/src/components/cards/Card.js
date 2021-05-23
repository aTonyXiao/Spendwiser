import React from 'react';
import { cards } from '../../network/cards';
import { Text, View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import CardImage from './CardImage';
import {makeCancelable} from '../util/promise-helper'

export class Card extends React.Component {
    constructor(props) { 
        super(props);
        
        var cardInformation = props.props.card;
        console.log("Creating a card: ");
        console.log(cardInformation);
        this.state = {
            name: "",
            cardImage: "Not an Empty String",
            showDefault: true,
            // opacity: new Animated.Value(0),
            cardId: cardInformation.cardId,
            navigation: props.props.navigation,
            docId: cardInformation.docId,
            storeInformation: props.props.storeInformation,
            getCardImageURL: makeCancelable(cards.getCardImageURL(cardInformation.cardId)),
            getCardName: makeCancelable(cards.getCardName(cardInformation.cardId))
        }

        this.state.getCardImageURL.promise.then(url => {
            this.setState({cardImage: url, showDefault: url.length == 0});
        }).catch(({isCanceled, ...error}) => {});
        this.state.getCardName.promise.then((cardName) => {
            this.setState({name: cardName});
        }).catch(({isCanceled, ...error}) => {});
    }

    componentWillUnmount() {
        this.state.getCardName.cancel();
        this.state.getCardImageURL.cancel();
    }


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
                <Text style={styles.cardTitle}>{this.state.name}</Text>
                <TouchableOpacity activeOpacity={0.5} onPress={this.onPress}>
                    <CardImage
                        style={[ styles.card ]}
                        source={this.state.cardImage}
                        overlay={this.state.name}
                        default={this.state.showDefault}
                    />
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    scrollView: {
        width: "95%",
    },
    card: {
        resizeMode: "contain",
        width: "100%",
        height: (Dimensions.get('window').width * 0.9) / 1.586, // was hardcoded to 230 before
        marginBottom: 10
    }, 
    cardTitle: {
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 10,
        fontSize: 20 
    }
});