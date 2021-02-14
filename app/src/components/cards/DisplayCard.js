import { app } from 'firebase';
import React from 'react';
import { View, Text, StyleSheet, Button, Image } from 'react-native';
import { appBackend } from '../../network/backend';
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
    var name = "";
    var rewards;
    var userId = user.getUserId
    appBackend.dbGet("users." + userId + ".cards." + cardId, (data) => {
        console.log(name);
        name = data.name;
        rewards = data.rewards; 
    })

    deleteCard = () => {
        appBackend.dbDelete("users." + userId + ".cards" + cardId);
    }

    return (
        <View>
            <Text>{name}</Text>
            <Image
                source={cardImage}
                style={styles.card}
            />
            {/* TODO want to make add two fields for each reward that can be dropdowns for reward options */}
            <Button
                title="Delete this card"
                onPress={deleteCard}
            ></Button>
        </View>
    )
}