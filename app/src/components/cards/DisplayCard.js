import React, { useState } from 'react';
import { Dimensions, View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView, Modal, TextInput } from 'react-native';
import { cards } from '../../network/cards';
import { user } from '../../network/user';
import CachedImage from 'react-native-expo-cached-image';
import { Ionicons } from '@expo/vector-icons';
import { RewardModal } from './RewardModal';

export function DisplayCard({route, navigation}) {
    const cardId = route.params.cardId;
    const docId = route.params.docId;
    const cardImage = route.params.img;
    const userId = user.getUserId();
    const [cardName, setCardName] = useState("");
    const storeInformation = route.params.storeInformation;
    const [displayTransactions, setDisplayTransactions] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [displayRewards, setDisplayRewards] = useState(false);
    const [rewards, setRewards] = useState([]);
    const [hasConstructed, setHasConstructed] = useState(false);
    const [showTransactionModal, setShowTransactionModal] = useState(false);
    const [transactionInput, setTransactionInput] = useState("");
    const rewardModal = React.createRef();
    console.log(rewardModal);

    // simulate constructor for functional components
    const constructor = () => { 
        if (hasConstructed) { 
            return;
        } else { 
            cards.getCardName(cardId).then((name) => { 
                setCardName(name);
            });
    
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

    addTransaction = () => {
        user.saveTransactionToUser(
            userId, 
            cardId, 
            {
                storeName: storeInformation["label"],
                address: storeInformation["vicinity"],
                storeType: storeInformation["storeType"]
            },
            transactionInput
        );

        setShowTransactionModal(false);

        setTransactions([]);
        user.getTransactionsForCard(userId, cardId, (data) => {
            setTransactions((transactions) => { 
                const newTransactions = [...transactions, data];
                return newTransactions;
            })
        })
    }

    addReward = () => { 
        console.log("adding reward");
    }

    showRewardModal = () => { 
        if (rewardModal) { 
            rewardModal.showModal();
        }
    }

    return (
        <ScrollView 
            style={styles.container} 
            contentContainerStyle={styles.scrollviewContainer}
        >
            <Modal
                transparent={true}
                backdropOpacity={0.3}
                visible={showTransactionModal}
            >
                <View style={modalStyles.modalCenteredView}>
                    <View style={modalStyles.modalView}>
                        <View style={modalStyles.modalHeader}>
                            <TouchableOpacity onPress={() => setShowTransactionModal(false)}>
                                <Ionicons
                                    name="close-circle-outline"
                                    color="black"
                                    size={26}
                                ></Ionicons>
                            </TouchableOpacity>
                        </View>
                        <Text style={modalStyles.modalText}>Adding a transaction at</Text>
                        <Text style={modalStyles.storeText}>{storeInformation.value}</Text>
                        <Text style={modalStyles.modalText}>How much did you spend?</Text>
                        <TextInput
                            style={modalStyles.manualTextInput}
                            onChangeText={(text) => setTransactionInput(text)}
                            value={transactionInput}
                            placeholder={"amount in dollars"}
                            onSubmitEditing={addTransaction}
                        />
                    </View>
                </View>
            </Modal>

            {/* <RewardModal ref={rewardModal}></RewardModal> */}
            
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
                    <View>
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
                <TouchableOpacity style={styles.addTransactionButton} onPress={() => setShowTransactionModal(true)}>
                    <Text>Add a transaction</Text>
                </TouchableOpacity>

                <Text style={styles.sectionTitle}>Rewards</Text>
                {
                    displayRewards && 
                    rewards.map((reward, i) => {
                        var category = reward[0];
                        var amountCents = reward[1]; 
                        return (
                            <View style={styles.sectionText} key={i}>
                                <Text style={{ fontWeight: 'bold' }}>{category}</Text>
                                <Text style={{ marginLeft: 5 }}>{amountCents} cents</Text>
                            </View>
                        )
                    })
                }
                <TouchableOpacity style={styles.addTransactionButton} onPress={showRewardModal}>
                    <Text style={{}}>Add a reward</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.deleteContainer} onPress={confirmDelete}> 
                <Text style={styles.deleteText}>Delete this card</Text>
            </TouchableOpacity>
        </ScrollView>
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
        padding: 10,
        fontSize: 16,
        backgroundColor: '#28b573',
        color: 'white'
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
        marginBottom: 10,
        marginTop: 10
    },
    deleteText: {
        fontSize: 16,
        color: 'red',
    }
});

const modalStyles = StyleSheet.create({
    modalCenteredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'stretch',
        marginTop: 22,
        padding: 22,
        backgroundColor: 'rgba(128, 128, 128, 0.5)'
    },
    modalView: {
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'stretch',
        borderRadius: 4,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    modalHeader: { 
        position: 'absolute',
        top: 8, 
        left: 8
    },
    modalText: {
        marginTop: 10,
        alignSelf: 'center',
        fontSize: 16
    },
    storeText: {
        alignSelf: 'center',
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 10
    },
    manualTextInput: {
        height: 40,
        borderWidth: 1,
        margin: 15,
        marginTop: 7,
        marginBottom: 7,
        width: '90%',
        borderColor: '#F0F0F0',
        backgroundColor: '#F0F0F0',
        borderRadius: 5,
    },
});