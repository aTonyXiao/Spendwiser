import React, { useEffect } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from 'react';
import { user } from '../../../network/user';
import { cards } from '../../../network/cards';

// TODO: change to "CardSelectFromImage"
// TODO: handle no text

export function CardSelectImage({route, navigation}) {
    const text = route.params.text;
    const userId = user.getUserId();
    const [cardMap, setCardMap] = useState(null); // card name to card id
    const [hasConstructed, setHasConstructed] = useState(false);
    const [currentUserCards, setCurrentUserCards] = React.useState([]);
    const [filteredCardNames, setFilteredCardNames] = React.useState([]);
    const [chosenCard, setChosenCard] = useState('');

    // simulate constructor for functional components
    const constructor = () => { 
        if (hasConstructed) { 
            return;
        } else { 
            setHasConstructed(true);

            // get current user cards to later check for already existing card
            user.getCards(userId).then((cards) => {
                setCurrentUserCards(cards);
            })

            // get card names of all cards in database to list in 
            cards.getCardNames((mapping) => {
                setCardMap(mapping);

                let matchedCardNames = [];

                let originalCardNames = Object.keys(mapping);

                console.log('trying to match card names')

                // filter card names for detected words from imag
                originalCardNames.forEach(cardName => { 
                    for (let i=0 ; i<text.length ; i++) { 
                        detectedWord = text[i];

                        const regex = new RegExp(`${detectedWord.trim()}`, 'i');
                        if (cardName.search(regex) >= 0) { 
                            matchedCardNames.push(cardName);
                        }
                    }
                })

                console.log(matchedCardNames.length);

                setFilteredCardNames(matchedCardNames);
            });
        }
    }
    constructor();

    useEffect(()=> {
        if (chosenCard != '') { 
            addCard();
        }
    })

    const addCard = () => {
        // TODO: this should be navigate to add card confirm
        var cardId = cardMap[chosenCard];
        var currentCardIds = [];
        for (var card in currentUserCards) {
            currentCardIds.push(currentUserCards[card].cardId);
        }

        // check for user trying to add card they already have
        if (!currentCardIds.includes(cardId)) {
            user.saveCardToUser(userId, cardId, null, null);
        } else {
            Alert.alert("Already have this card",
                "You've attempted to add a card that has already been added to your account",
                [
                    { text: "Ok" }
                ],
                { cancelable: false });
        }

        navigation.navigate('YourCards');
    }

    return (
        <ScrollView style={styles.container}>

            <Text style={styles.title}>Here's a list of possible cards we found: </Text>

            {/* List of cards */}
            {/* TODO: styling */}
            {
                filteredCardNames.map((cardName, i) => { 
                    return (
                        <TouchableOpacity key={i} onPress={()=> {setChosenCard(cardName)}}>
                            <Text style={styles.body}>{cardName}</Text>
                        </TouchableOpacity>
                    )
                })
            }
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        height: '100%'
    },
    title: {
        marginTop: 20,
        alignSelf: 'center'
    }, 
    body: {
        margin: 5
    }
})
