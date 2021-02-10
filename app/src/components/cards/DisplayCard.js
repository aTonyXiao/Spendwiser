import React from 'react';
import { View, Text, StyleSheet, Button, Image } from 'react-native';
import { appBackend } from '../../network/backend';

function DisplayCard({route, navigation}) {
    const { cardId } = route.params;

        // this.state = {
        //     name: cardInformation.original_title,
        //     rewards: cardInformation.rewards,
        //     rewards_type: cardInformation.rewards_type,
        //     url: cardInformation.url
        // }

    return (
        <View>
            {/* Card name */}
            {/* Card picture */}
            {/* Card information */}
            {/* Edit card information */}
            {/* Delete card */}
        </View>
    )
}