import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Button, View, Text } from 'react-native';
import mainStyles from '../../styles/mainStyles';
import { Card } from './Card';
import { user } from '../../network/user';
import { useState, useEffect } from "react";

const styles = StyleSheet.create({
    scrollView: {
        width: "95%"
    },
});

// TODO: bug where card names only show after going to add card and back
export function YourCards({navigation}) { 
    const [cards, setCards] = useState([]);
    const userId = user.getUserId();

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadCards(userId);
        });
        return unsubscribe;
    }, [navigation]);


    function loadCards(userId) {
        user.getCards(userId).then((cards) => {
            setCards(cards);
        })
    };

    if (cards.length == 0) { 
        return (
            <View>
                <Text>You currently have no stored cards!</Text>
                <Button title="Add Card" onPress={() => navigation.navigate('AddCard')}></Button>
            </View>
        )
    }

    return (
        <SafeAreaView style={mainStyles.container}>
            <ScrollView style={styles.scrollView}>
                <View>
                    {cards.map((card, i) => {
                        var props = {
                            navigation: navigation,
                            card: card
                        }
                        return <Card key={i} props={props}/>
                    })}
                </View>
                <Button title="Add Card" onPress={() => navigation.navigate('AddCard')}></Button>
            </ScrollView>
        </SafeAreaView>
    );
}