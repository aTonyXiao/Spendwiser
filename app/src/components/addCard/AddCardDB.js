import React from 'react';
import { View, Button, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from 'react';
import { user } from '../../network/user';
import mainStyles from '../../styles/mainStyles';
import { cards } from '../../network/cards';
import Autocomplete from 'react-native-autocomplete-input'

export function AddCardDB({navigation}) {
    const userId = user.getUserId();
    const [query, setQuery] = useState("");
    const [cardMap, setCardMap] = useState(null);
    const [hasConstructed, setHasConstructed] = useState(false);
    const [cardNames, setCardNames] = useState([]);

    // simulate constructor for functional components
    const constructor = () => { 
        if (hasConstructed) { 
            return;
        } else { 
            console.log('running constructor')
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
        var cardId = cardMap[query];
        user.saveCardToUser(userId, cardId, null, null);
        navigation.navigate('YourCards');
    }

    return (
        <View style={mainStyles.container}>
            <View style={styles.autocompleteContainer}>
                <Autocomplete
                    data={cardNames}
                    defaultValue={query}
                    onChangeText={text => setQuery(text)}
                    renderItem={({ item, i }) => (
                        <TouchableOpacity onPress={() => setQuery(item)}>
                            <Text>{item}</Text>
                        </TouchableOpacity>
                    )}
                />
            </View>
            <Button
                title='Add this card'
                onPress={addCard}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    autocompleteContainer: {
        flex: 1,
        left: 0,
        position: 'absolute',
        right: 0,
        top: 0,
        zIndex: 1
    }
})
