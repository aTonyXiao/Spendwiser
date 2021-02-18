import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, Image,  Alert, useColorScheme } from 'react-native';
import { cards } from '../../network/cards';
import { user } from '../../network/user';

const styles = StyleSheet.create({
    card: {
        resizeMode: "contain",
        width: "100%",
        height: 230, // hard coded for now
        marginBottom: 10,
    }, 
});

export function DisplayCard({route, navigation}) {
    const cardId = route.params.cardId;
    const cardImage = require("../../../assets/cards/blank.png");
    const userId = user.getUserId();
    const [cardName, setCardName] = useState("");

    useEffect(() => {
        cards.getCardName(cardId).then((name) => { 
            setCardName(name);
        });
        // const cardRewards = cards.getCardRewards(cardId);
    })

    const confirmDelete = () => {
        Alert.alert(
            'Are you sure you would like to delete this card from your profile?',
            'nother',
            [
              {text: 'NO', onPress: () => console.log('NO Pressed'), style: 'cancel'},
              {text: 'YES', onPress: () => deleteCard()},
            ]
          );
    };

    deleteCard = () => {
        console.log("deleteing card");

        // TODO this doesn't delete anything because the document id of the user isn't the card id
        console.log(cardId);
        user.deleteCard(userId, cardId);
        navigation.navigate('YourCards');
    }

    return (
        <View>
            <Text>{cardName}</Text>
            <Image
                source={cardImage}
                style={styles.card}
            />
            {/* TODO want to make add two fields for each reward that can be dropdowns for reward options */}
            <Button
                title="Delete this card"
                onPress={confirmDelete}
            ></Button>
        </View>
    )
}