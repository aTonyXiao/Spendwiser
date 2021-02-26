import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, Alert, TouchableOpacity } from 'react-native';
import { cards } from '../../network/cards';
import { user } from '../../network/user';
import CachedImage from 'react-native-expo-cached-image';

export function DisplayCard({route, navigation}) {
    const cardId = route.params.cardId;
    const docId = route.params.docId;
    const cardImage = route.params.img;
    const userId = user.getUserId();
    const [cardName, setCardName] = useState("");

    const [displayTransactions, setDisplayTransactions] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [displayRewards, setDisplayRewards] = useState(false);
    const [rewards, setRewards] = useState([]);

    const [hasConstructed, setHasConstructed] = useState(false);

    // simulate constructor for functional components
    const constructor = () => { 
        if (hasConstructed) { 
            return;
        } else { 
            cards.getCardName(cardId).then((name) => { 
                console.log(name);
                setCardName(name);
            });
    
            user.getTransactions(userId, docId, (data) => { 
                console.log(data);
                setTransactions(data);
                setDisplayTransactions(true);
            })

            // user.getRewards(cardId).then((rewards) => {
                // setRewards;
            // })
            // const cardRewards = cards.getCardRewards(cardId);

            setHasConstructed(true);
        }
    }
    constructor();

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
        user.deleteCard(userId, docId);
        navigation.navigate('YourCards');
    }

    addTransaction = () => {
        // console.log("adding transaction")
        // user.addTransaction()
    }

    return (
        <View>
            <Text>{cardName}</Text>
            <CachedImage
                source={cardImage}
                style={styles.card}
            />

            <Text>Transactions</Text>
            {
                displayTransactions &&
                <View>
                    {
                        transactions.map((transaction, i) => {
                            console.log(transaction);
                            <Text>hi{transaction.amountSpent}</Text>
                        })
                    }
                </View>
            }
            <TouchableOpacity onPress={addTransaction}>
                <Text>Add a transaction</Text>
            </TouchableOpacity>

            {/* <Text>Rewards</Text> */}
            {/* {
                displayRewards && 
                rewards.map((reward, i) => { 
                    <Text></Text>
                })
            } */}
            {/* TODO want to make add two fields for each reward that can be dropdowns for reward options */}
            <Button
                title="Delete this card"
                onPress={confirmDelete}
            ></Button>
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        resizeMode: "contain",
        width: "100%",
        height: 230, // hard coded for now
        marginBottom: 10,
    }, 
});