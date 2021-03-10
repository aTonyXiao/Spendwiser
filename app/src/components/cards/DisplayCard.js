import React, { useEffect, useState } from 'react';
import { Dimensions, View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView, SafeAreaView, Modal, TextInput, StatusBar } from 'react-native';
import { cards } from '../../network/cards';
import { user } from '../../network/user';
import CachedImage from 'react-native-expo-cached-image';
import { Ionicons } from '@expo/vector-icons';
import { RewardModal } from './RewardModal';
import { EditTransactionModal } from './EditTransactionModal';
import { TransactionModal } from './TransactionModal';
import CardImage from './CardImage';

/**
 * Display for a single credit card. Shows information about a card's rewards as well
 * as giving options to add a transaction to be associated with a its particular card.
 * 
 * @param {{Object, Object}} obj - The route and navigation passed directly to display card
 * @param {Object} obj.route - routing object containing information about a specific credit card
 * @param {Object} obj.navigation - navigation object used to move between different pages
 * @module DisplayCard
 */
function DisplayCard({route, navigation}) {
    const cardId = route.params.cardId;
    const docId = route.params.docId;
    const cardImage = route.params.img;
    const origin = route.params.origin;
    const userId = user.getUserId();
    const [cardName, setCardName] = useState("");
    const storeInformation = route.params.storeInformation;
    const [displayTransactions, setDisplayTransactions] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [displayRewards, setDisplayRewards] = useState(false);
    const [rewards, setRewards] = useState([]);
    const [hasConstructed, setHasConstructed] = useState(false);
    const [showTransactionModal, setShowTransactionModal] = useState(false);
    const [showEditTransactionOption, setShowEditTransactionOption] = useState(false);
    const [currentTransactionIndex, setCurrentTransactionIndex] = useState(-1);
    const [currentTransaction, setCurrentTransaction] = useState(null);
    const [showEditTransactionModal, setShowEditTransactionModal] = useState(false);

    const constructor = () => { 
        if (hasConstructed) { 
            return;
        } else {
            cards.getCardName(cardId).then((name) => { 
                setCardName(name);
            });

            setTransactions([]);
            setCurrentTransactionIndex(-1);
            setShowEditTransactionOption(false);
            user.getTransactionsForCard(userId, cardId, (data) => {
                setTransactions((transactions) => { 
                    const newTransactions = [...transactions, data];
                    return newTransactions;
                })
                    
                setDisplayTransactions(true);
            })

            user.getRewards(userId, cardId, (data) => { 
                setRewards(Object.entries(data));
                setDisplayRewards(true);
            })

            setHasConstructed(true);
        }
    }
    constructor();

    const confirmDelete = () => {
        Alert.alert(
            'Are you sure you would like to delete this card from your profile?',
            'please select one',
            [
              {text: 'NO', onPress: () => console.log(''), style: 'cancel'},
              {text: 'YES', onPress: () => deleteCard()},
            ]
          );
    };

    deleteCard = () => {
        user.deleteCard(userId, cardId, docId);
        navigation.navigate('YourCards');
    }

    console.log(cardImage.uri)

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView 
                style={styles.container} 
                contentContainerStyle={styles.scrollviewContainer}
            >
                <EditTransactionModal
                    transaction={currentTransaction}
                    modalVisible={showEditTransactionModal}
                    setModalVisible={setShowEditTransactionModal}
                    setHasConstructed={setHasConstructed}
                ></EditTransactionModal>

                <TransactionModal
                    storeInformation={storeInformation}
                    showTransactionModal={showTransactionModal}
                    setShowTransactionModal={setShowTransactionModal}
                    setHasConstructed={setHasConstructed}
                    cardId={cardId}
                ></TransactionModal>

                {/* TODO: Add reward modal in beta version*/}

                <View style={{justifyContent: 'flex-start'}}>
                    <Text style={styles.cardTitle}>{cardName}</Text>

                    <CardImage
                        style={[ styles.card ]}
                        source={cardImage.uri}
                        overlay={cardName}
                        default={cardImage.uri === undefined}
                    />

                    {
                        showEditTransactionOption &&
                        <View>
                            <TouchableOpacity onPress={() => setShowEditTransactionModal(true)}>
                                <Text style={styles.editTransactionText}>Edit this transaction</Text>
                            </TouchableOpacity>
                        </View>
                    }

                    <View style={styles.sectionTitle}>
                        <Text style={styles.sectionTitleText}>Transactions</Text> 
                        <TouchableOpacity
                            onPress={() => setShowTransactionModal(true)}
                            style={{margin: 5}}
                        >
                            <Ionicons
                                name="add-circle-outline"
                                color="white"
                                size={22}
                            ></Ionicons>
                        </TouchableOpacity>
                    </View>
                    {
                        displayTransactions &&
                        <View>
                            {
                                transactions.map((transaction, i) => {
                                    var date = transaction.dateAdded.toDate().toDateString();
                                    var name = transaction.storeInfo.storeName;
                                    var dollarAmount = transaction.amountSpent;
                                    return (
                                        <TouchableOpacity
                                            style={
                                                (currentTransactionIndex == i) ?
                                                styles.sectionTextSelected :
                                                styles.sectionText
                                            } 
                                            key={i}
                                            onPress={() => { 
                                                if (i == currentTransactionIndex) { 
                                                    setShowEditTransactionOption(false);
                                                    setCurrentTransactionIndex(-1);
                                                } else {
                                                    setCurrentTransactionIndex(i);
                                                    setShowEditTransactionOption(true);
                                                    setCurrentTransaction(transaction);
                                                }
                                            }}
                                        >
                                            <Text style={styles.transactionTextLeft}>{date}</Text>
                                            <Text style={styles.transactionTextRight}>{name}: ${dollarAmount}</Text>
                                        </TouchableOpacity>
                                    )
                                })
                            }
                        </View>
                    }
                    {
                        (transactions.length == 0) &&
                        <View>
                            <Text style={styles.sectionText}>You currently have no transactions!</Text>
                        </View>
                    }


                    <View style={styles.sectionTitle}>
                        <Text style={styles.sectionTitleText}>Rewards</Text> 
                        <TouchableOpacity
                            // onPress={() => setShowTransactionModal(true)}
                            style={{margin: 5}}
                        >
                            <Ionicons
                                name="add-circle-outline"
                                color="white"
                                size={22}
                            ></Ionicons>
                        </TouchableOpacity>
                    </View>
                    {
                        displayRewards && 
                        rewards.map((reward, i) => {
                            var category;
                            var amountCents;
                            // temporary way to tell if card is a manual addition
                            if (typeof(rewards[0][0]) == 'string') {
                                category = reward[1].type;
                                amountCents = reward[1].value;
                            } else { 
                                category = reward[0];
                                amountCents = reward[1]; 
                            }

                            return (
                                <View style={styles.sectionText} key={i}>
                                    <Text style={{ fontWeight: 'bold' }}>{category}</Text>
                                    <Text style={{ marginLeft: 5 }}>{amountCents} cents</Text>
                                </View>
                            )
                        })
                    }
                </View>
                {
                    (origin !== "main") &&
                    <TouchableOpacity style={styles.deleteContainer} onPress={confirmDelete}> 
                        <Text style={styles.deleteText}>Delete this card</Text>
                    </TouchableOpacity>
                }
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        height: '100%', 
        // justifyContent: 'space-between',
        flex: 1
    },
    scrollviewContainer: { 
        justifyContent: 'space-between',
        flexGrow: 1
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
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        height: 35,
        justifyContent: 'space-between',
        backgroundColor: '#28b573',
        alignItems: 'center'
    },
    sectionTitleText: {
        padding: 10,
        fontSize: 16,
        color: 'white'
    },
    sectionTextSelected: {
        display: 'flex',
        width: '100%', 
        height: 35,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomColor: 'lightgray',
        borderBottomWidth: 1,
        backgroundColor: 'dodgerblue'
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
    transactionTextLeft: { 
        fontWeight : 'bold',
        marginLeft: 8
    },
    transactionTextRight: {
        marginLeft: 5,
        marginRight: 8,
        flex: 1,
        flexWrap: 'wrap',
        textAlign: 'right'
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
    editTransactionText: {
        margin: 5,
        color: 'dodgerblue',
        textAlign: 'right'
    },
    deleteContainer: { 
        alignItems: 'center',
        marginBottom: 10,
        marginTop: 10
    },
    deleteText: {
        fontSize: 16,
        color: 'red',
    }
});

export { DisplayCard };