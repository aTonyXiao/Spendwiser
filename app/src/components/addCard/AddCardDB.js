import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from 'react';
import { user } from '../../network/user';
import { cards } from '../../network/cards';
import Autocomplete from 'react-native-autocomplete-input';
import { Ionicons } from '@expo/vector-icons';
import mainStyles from '../../styles/mainStyles';

export function AddCardDB({navigation}) {
    const userId = user.getUserId();
    const [query, setQuery] = useState("");
    const [cardMap, setCardMap] = useState(null);
    const [hasConstructed, setHasConstructed] = useState(false);
    const [cardNames, setCardNames] = useState([]);
    const [displayErrorText, setDisplayErrorText] = React.useState(false);
    const [hideResults, setHideResults] = React.useState(true);

    // simulate constructor for functional components
    const constructor = () => { 
        if (hasConstructed) { 
            return;
        } else { 
            cards.getCardNames((mapping) => {
                setCardMap(mapping);
                if (cardMap != null) { 
                    setCardNames(Object.keys(cardMap));
                }
                setHasConstructed(true);
            });
        }
    }
    constructor();

    addCard = () => { 
        if (!query) {
            setDisplayErrorText(true);

            setTimeout(function() { 
                setDisplayErrorText(false);
            }, 2000);
        } else { 
            // TODO: this should be navigate to add card confirm

            var cardId = cardMap[query];
            user.saveCardToUser(userId, cardId, null, null);
            navigation.navigate('YourCards')
        }
    }

    return (
        <View style={styles.container}>
            <Text style={mainStyles.title}>Search For a Card</Text>

            {
                displayErrorText &&
                <Text style={styles.errorText}>Please input a query into the search bar</Text>
            }
            <View style={styles.autocompleteContainer}>
                {/* TODO add filter for items to render */}
                <Autocomplete
                    inputContainerStyle={styles.autocompleteTextInput}
                    listStyle={styles.autocompleteList}
                    data={cardNames}
                    hideResults={hideResults}
                    defaultValue={query}
                    onChangeText={text => { 
                        if (text) { 
                            setHideResults(false);
                        } else { 
                            setHideResults(true);
                        }
                        setQuery(text);
                    }}
                    renderItem={({ item, i }) => (
                        <TouchableOpacity onPress={() => setQuery(item)}>
                            <Text style={styles.autocompleteListText}>{item}</Text>
                        </TouchableOpacity>
                    )}
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
        top: 90,
        zIndex: 1
    },
    enterIcon : { 
        position: 'absolute',
        right: 20,
        top: 90
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
    },
    autocompleteListText : {
        margin: 5
    }
})
