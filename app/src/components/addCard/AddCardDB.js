import React from 'react';
import { Alert, View, Text, TouchableOpacity, StyleSheet, Dimensions, SafeAreaView } from 'react-native';
import { useState } from 'react';
import { user } from '../../network/user';
import { cards } from '../../network/cards';
import Autocomplete from 'react-native-autocomplete-input';
import { Ionicons } from '@expo/vector-icons';
import mainStyles from '../../styles/mainStyles';
import { DismissKeyboard } from '../util/DismissKeyboard';
import * as storage from '../../local/storage';
import { appBackend } from '../../network/backend';
import { BackButtonHeader } from '../util/BackButtonHeader';


export function AddCardDB({existingUserCards, navigation}) {
    const userId = user.getUserId();
    const [query, setQuery] = useState("");
    const [cardMap, setCardMap] = useState(null);
    const [hasConstructed, setHasConstructed] = useState(false);
    const [originalCardNames, setOriginalCardNames] = useState([]);
    const [filteredCardNames, setFilteredCardNames] = useState([]);
    const [displayErrorText, setDisplayErrorText] = React.useState(false);
    const [hideResults, setHideResults] = React.useState(true);
    const [currentUserCards, setCurrentUserCards] = React.useState([]);

    // simulate constructor for functional components
    const constructor = () => { 
        if (hasConstructed) { 
            return;
        } else { 
            user.getCards(userId).then((cards) => {
                setCurrentUserCards(cards);
            })
            cards.getCardNames((mapping) => {
                setCardMap(mapping);
                if (cardMap != null) { 
                    setOriginalCardNames(Object.keys(cardMap));
                    setFilteredCardNames(Object.keys(cardMap));
                }
                setHasConstructed(true);
            });
        }
    }
    constructor();

    addCard = () => { 
        console.log("Adding a card");
        if (!query) {
            setDisplayErrorText(true);

            setTimeout(function() { 
                setDisplayErrorText(false);
            }, 2000);
        } else { 
            // TODO: this should be navigate to add card confirm
            var cardId = cardMap[query];
            var currentCardIds = [];
            for (var card in currentUserCards) {
                currentCardIds.push(currentUserCards[card].cardId);
            }

            if (!currentCardIds.includes(cardId)) {
                cards.getCardData(cardId, async (data) => {
                    // Add the card into the user's list of cards
                    await user.saveCardToUser(userId, cardId, null, null);
                    console.log("Saved card to user");

                    // Add the actual card data as well
                    appBackend.remoteDBGet("cards", ['cardId', '==', cardId], async (cardData) => {
                        console.log("Got card data");
                        // console.log(cardData);
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
                                {text: "Ok"}
                            ],
                            { cancelable: false });
                navigation.navigate('YourCards')
            }
        }
    }

    filterData = () => { 
        if (query == "") { 
            setFilteredCardNames(originalCardNames);
        }

        const regex = new RegExp(`${query.trim()}`, 'i');
        setFilteredCardNames(originalCardNames.filter(cardName => cardName.search(regex) >= 0));
    }

    return (
        <DismissKeyboard>
            <SafeAreaView style={mainStyles.screen}>
                <BackButtonHeader navigation={navigation} title={"Search for a Card"} titleStyle={mainStyles.titleNoPadding} />
                <View style={mainStyles.bodyContainer}>

                {
                    displayErrorText &&
                    <Text style={styles.errorText}>Please input a query into the search bar</Text>
                }
                <View style={styles.autocompleteContainer}>
                    <Autocomplete
                        inputContainerStyle={styles.autocompleteTextInput}
                        listStyle={styles.autocompleteList}
                        data={filteredCardNames}
                        hideResults={hideResults}
                        defaultValue={query}
                        onChangeText={text => {
                            if (text) {
                                setHideResults(false);
                            } else {
                                setHideResults(true);
                            }
                            setQuery(text);
                            filterData();
                        }}
                        renderItem={({ item, i }) => (
                            <TouchableOpacity onPress={() => setQuery(item)}>
                                <Text style={styles.autocompleteListText}>{item}</Text>
                            </TouchableOpacity>
                        )}
                        keyExtractor={(item, index) => {
                            return index.toString();
                        }}
                    />
                </View>
                <View style={styles.enterIcon}>
                    <TouchableOpacity onPress={addCard}>
                        <Ionicons
                            name="enter"
                            color="#28b573"
                            size={32}
                        ></Ionicons>
                    </TouchableOpacity>
                </View>
            </View>
            </SafeAreaView>
        </DismissKeyboard>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        height: '100%'
    },
    autocompleteContainer : {
        flex: 1,
        left: 30,
        position: 'absolute',
        right: 70,
        zIndex: 1
    },
    enterIcon : { 
        position: 'absolute',
        right: 20,
    },
    errorText : { 
        color:'red',
        textAlign: 'center'
    }, 
    autocompleteTextInput : {
        borderColor: 'white',
        borderBottomColor: '#28b573'
    }, 
    autocompleteList : { 
        borderColor: 'white',
        maxHeight: Dimensions.get('window').height - 200,
    },
    autocompleteListText : {
        margin: 5
    }
})
