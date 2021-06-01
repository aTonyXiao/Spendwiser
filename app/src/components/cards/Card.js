import React, { useEffect, useState } from 'react';
import { cards } from '../../network/cards';
import { Text, View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import CardImage from './CardImage';
import {makeCancelable} from '../util/promise-helper'

export function Card({
        key,
        navigation,
        card,
        storeInformation,
        origin,
        cardToEnableDisable,
        setCardToEnableDisable
    }) {
    const [name, setName] = useState("");
    const [showDefault, setShowDefault] = useState(true);
    const [cardImage, setCardImage] = useState("Not an Empty String");
    

    // on press, navigate to the CardInfo page
    const onPressToCard = () => { 
        navigation.navigate('CardInfo', {
            cardId: card.cardId,
            docId: card.docId,
            storeInformation: storeInformation,
            img: showDefault ? require('../../../assets/cards/blank.png') : { uri: cardImage },
        })
    };

    useEffect(() => {
        const getCardImageURL = makeCancelable(cards.getCardImageURL(card.cardId));
        const getCardName = makeCancelable(cards.getCardName(card.cardId));
        if (card !== null) {
            getCardImageURL.promise.then(url => {
                setCardImage(url);
                setShowDefault(url.length == 0);
            }).catch(({isCanceled, ...error}) => {});
            // get the card name from cards
            getCardName.promise.then((cardName) => {
                setName(cardName);
            }).catch(({isCanceled, ...error}) => {});
        }
        return () => {
            getCardName.cancel();
            getCardImageURL.cancel();
        }
    }, [])

    return(
        <View>
            <Text numberOfLines={1} style={styles.cardTitle}>{name}</Text>
            <TouchableOpacity activeOpacity={0.5} onPress={() => onPressToCard()}>
                <CardImage
                    style={[ styles.card ]}
                    source={cardImage}
                    overlay={name}
                    defaultImg={showDefault}
                    cardId={card.cardId}
                    cardToEnableDisable={cardToEnableDisable}
                    setCardToEnableDisable={setCardToEnableDisable}
                />
            </TouchableOpacity>
        </View>
    );
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