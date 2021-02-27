import React, { useEffect, useState } from 'react';
import { Dimensions, View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
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
    
            user.getTransactionsForCard(userId, cardId, (data) => {
                setTransactions((transactions) => { 
                    const newTransactions = [...transactions, data];
                    return newTransactions;
                })
                    
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
            'please select one',
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
        <View style={styles.container}>
            <View style={{justifyContent: 'flex-start'}}>
                <Text style={styles.cardTitle}>{cardName}</Text>
                <CachedImage
                    source={cardImage}
                    style={styles.card}
                />

                {/* TODO maybe these sections should be collapsible? */}
                <Text style={styles.sectionTitle}>Transactions</Text> 
                {
                    displayTransactions &&
                    <View style={styles.sectionBody}>
                        {
                            transactions.map((transaction, i) => {
                                var date = transaction.dateAdded.toDate().toDateString();
                                var name = transaction.storeInfo.storeName;
                                var dollarAmount = transaction.amountSpent;
                                return (
                                    // TODO each row should be swipeable -> delete
                                    <View style={styles.sectionText} key={i}>
                                        <Text style={{fontWeight : 'bold'}}>{date}</Text>
                                        <Text style={{marginLeft: 5}}>{name}: ${dollarAmount}</Text>
                                    </View>
                                )
                            })
                        }
                    </View>
                }
                <TouchableOpacity style={styles.addTransactionButton} onPress={addTransaction}>
                    <Text style={{}}>Add a transaction</Text>
                </TouchableOpacity>

                <Text style={styles.sectionTitle}>Rewards</Text>
                {/* {
                displayRewards && 
                rewards.map((reward, i) => { 
                    <Text></Text>
                })
                } */}
                {/* TODO want to make add two fields for each reward that can be dropdowns for reward options */}
            </View>

            <TouchableOpacity style={styles.deleteContainer} onPress={confirmDelete}> 
                <Text style={styles.deleteText}>Delete this card</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        height: '100%', 
        justifyContent: 'space-between'
    },
    cardTitle: { 
        textAlign: 'center',
        marginTop: 25,
        fontSize: 24
    },
    card: {
        width: Dimensions.get('window').width * .9,  //its same to '20%' of device width
        aspectRatio: 1.5, // <-- this
        resizeMode: "contain",
        height: 230, // hard coded for now
        marginBottom: 10,
        alignSelf: 'center'
    }, 
    sectionTitle: {
        padding: 10,
        fontSize: 16,
        backgroundColor: '#28b573',
        color: 'white'
    },
    sectionBody: { 
    },
    sectionText: {
        display: 'flex',
        width: '100%',
        height: 35,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomColor: 'lightgray',
        borderBottomWidth: 1
    },
    addTransactionButton: {
        display: 'flex',
        width: '100%',
        height: 35,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomColor: 'lightgray',
        borderBottomWidth: 1,
        backgroundColor: '#f5f5f5'
    },
    deleteContainer: { 
        alignItems: 'center',
        marginBottom: 10
    },
    deleteText: {
        fontSize: 16,
        color: 'red',
    }
});