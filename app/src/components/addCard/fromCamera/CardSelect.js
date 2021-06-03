import React, { useEffect } from 'react';
import { 
    Alert, 
    ScrollView, 
    Text, 
    TouchableOpacity, 
    StyleSheet, 
    Button,
    View,
    SafeAreaView
} from 'react-native';
import { useState } from 'react';
import { user } from '../../../network/user';
import { cards } from '../../../network/cards';
import { appBackend } from '../../../network/backend';
import * as storage from '../../../local/storage';
import mainStyles from '../../../styles/mainStyles';

/**
 * Page that allows user to select an image after taking a picture of their card
 * 
 * @param {{Object, Object}} obj - The route and navigation passed directly to display card
 * @param {Object} obj.route - routing object containing information about a specific credit card
 * @param {Object} obj.navigation - navigation object used to move between different pages
 * @module CardSelect
 */
export function CardSelect({route, navigation}) {
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

                // filter card names for detected words from image
                originalCardNames.forEach(cardName => { 
                    for (let i=0 ; i<text.length ; i++) { 
                        let detectedWord = text[i];

                        const regex = new RegExp(`${detectedWord.trim()}`, 'i');
                        if ((cardName.search(regex) >= 0) && (!matchedCardNames.includes(cardName))) { 
                            matchedCardNames.push(cardName);
                        }
                    }
                })

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

    const addCard = async () => {
        // TODO: this should be navigate to add card confirm
        var cardId = cardMap[chosenCard];
        var currentCardIds = [];
        for (var card in currentUserCards) {
            currentCardIds.push(currentUserCards[card].cardId);
        }

        // check for user trying to add card they already have
        if (!currentCardIds.includes(cardId)) {
            cards.getCardData(cardId, async (data) => {
                // Add the card into the user's list of cards
                await user.saveCardToUser(userId, cardId, null, null);

                // Add the actual card data as well
                appBackend.remoteDBGet("cards", ['cardId', '==', cardId], async (cardData) => {
                    let actualUserId = await userId;
                    storage.addLocalDB(actualUserId, "cards", cardData, true, (dbId) => {
                        storage.modifyDBEntryMetainfo(actualUserId, "cards", true, dbId, cardId, () => {
                            navigation.navigate('YourCards', { forceLoad: true });
                        });
                    });
                });
            });
        } else {
            Alert.alert("Already have this card",
                "You've attempted to add a card that has already been added to your account",
                [
                    { text: "Ok" }
                ],
                { cancelable: false });

            navigation.navigate('YourCards', { forceLoad: true });
        }
    }

    return (
        <SafeAreaView style={mainStyles.screen}>
            <View style={mainStyles.bodyContainer}>
                <ScrollView style={styles.container}>
                    {/* No cards found */}
                    {
                        filteredCardNames.length == 0 &&
                        <View>
                            <Text style={styles.noCards}>We couldn't find any cards from your image</Text>

                            <Button
                                title="Try another image"
                                onPress={() => {navigation.navigate('ChooseImage')}}
                            >
                            </Button>

                            <Button
                                title="Go back to your cards"
                                onPress={() => {navigation.navigate('YourCards', { forceLoad: true })}}
                            >
                            </Button>
                        </View>
                    }

                    {/* Found cards */}
                    {
                        filteredCardNames.length > 0 &&
                        <View>
                            <Text style={styles.title}>Here's a list of possible cards we found: </Text>

                            {/* List of cards */}
                            {
                                filteredCardNames.map((cardName, i) => {
                                    return (
                                        <TouchableOpacity key={i} onPress={() => { setChosenCard(cardName) }}>
                                            <Text style={styles.body}>{cardName}</Text>
                                        </TouchableOpacity>
                                    )
                                })
                            }
                        </View>
                    }
                </ScrollView>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        height: '100%'
    },
    title: {
        marginTop: 30,
        alignSelf: 'center', 
        fontSize: 18,
        marginBottom: 10,
        textDecorationLine: 'underline'
    }, 
    noCards: {
        marginTop: 100,
        alignSelf: 'center', 
        fontSize: 18,
        marginBottom: 10,
    },
    body: {
        margin: 5
    }
})
