import React, { useState } from 'react';
import { 
    Dimensions, 
    View, 
    Text, 
    StyleSheet, 
    Alert, 
    TouchableOpacity, 
    ScrollView, 
    SafeAreaView, 
} from 'react-native';
import { cards } from '../../network/cards';
import { user } from '../../network/user';
import { Ionicons } from '@expo/vector-icons';
import { RewardModal } from './RewardModal';
import { EditTransactionModal } from './EditTransactionModal';
import { TransactionModal } from './TransactionModal';
import CardImage from './CardImage';
import { SwipeListView } from 'react-native-swipe-list-view';
import { summaryHelper } from '../summary/SummaryHelper';
// TODO: need to add reward modal back in here?

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
    const storeInformation = user.currentStore;
    const [displayTransactions, setDisplayTransactions] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [displayRewards, setDisplayRewards] = useState(false);
    const [rewards, setRewards] = useState([]);
    const [hasConstructed, setHasConstructed] = useState(false);
    const [showTransactionModal, setShowTransactionModal] = useState(false);
    const [currentTransaction, setCurrentTransaction] = useState(null);
    const [showEditTransactionModal, setShowEditTransactionModal] = useState(false);
    const [showTransactionsList, setShowTransactionsList] = useState(origin !== "main" ? true : false);

    const constructor = () => { 
        if (hasConstructed) { 
            return;
        } else {
            cards.getCardName(cardId).then((name) => { 
                setCardName(name);
            });

            setTransactions([]);
            user.getTransactionsForCard(userId, cardId, (data) => {
                if (data !== null) {
                    console.log(data);
                    setTransactions((transactions) => { 
                        data["key"] = transactions.length.toString();
                        if (data) {
                            if (Array.isArray(data)) {
                                return [...data, ...transactions];
                            } else {
                                return summaryHelper.addSortedNewTransaction(transactions, data);
                                // return [... new Set([data, ...transactions])];
                            }
                        }
                        else {
                            return transactions;
                        }
                    })
                    setDisplayTransactions(true);
                }
            })

            user.getRewards(userId, cardId, (data) => { 
                setRewards(Object.entries(data));
                setDisplayRewards(true);
            })

            setHasConstructed(true);
        }
    }
    constructor();

    const deleteCard = () => {
        user.deleteCard(userId, cardId, docId);
        navigation.navigate('YourCards', { forceLoad: true });
    }
    
    const confirmDelete = () => {
        Alert.alert(
            'Are you sure you would like to delete this card from your profile?',
            'please select one',
            [
              {text: 'YES', onPress: () => deleteCard()},
              {text: 'NO', onPress: () => console.log(''), style: 'cancel'},
            ]
          );
    };

    const confirmDeleteTransaction = (trans) => {
        console.log(trans);
        Alert.alert(
            'Are you sure you would like to delete this transaction?',
            trans.storeInfo.storeName + '\n' + trans.dateAdded.toString().substring(0,24) + '\n$' + trans.amountSpent,
            [
              {text: 'YES', onPress: () => deleteTransaction(trans.docId, parseInt(trans.key))},
              {text: 'NO', onPress: () => console.log(''), style: 'cancel'},
            ]
          );
    };

    const deleteTransaction = (transDocId, key) => { 
        user.deleteTransaction(userId, transDocId);
        let newTransactions = [...transactions];
        newTransactions.splice(newTransactions.length - 1 - key, 1);
        setTransactions(newTransactions);
    }

    return (
        // <DismissKeyboard>
            <SafeAreaView style={styles.container}>
                <EditTransactionModal
                    transaction={currentTransaction}
                    modalVisible={showEditTransactionModal}
                    setModalVisible={setShowEditTransactionModal}
                    transactions={transactions}
                    setTransactions={setTransactions}
                ></EditTransactionModal>

                <TransactionModal
                    storeInformation={storeInformation}
                    showTransactionModal={showTransactionModal}
                    setShowTransactionModal={setShowTransactionModal}
                    setHasConstructed={setHasConstructed}
                    cardId={cardId}
                ></TransactionModal>

                <View style={{ justifyContent: 'flex-start'}}>
                    <Text style={styles.cardTitle}>{cardName}</Text>

                    <CardImage
                        style={[styles.card]}
                        source={cardImage.uri}
                        overlay={cardName}
                        default={cardImage.uri === undefined || cardImage.uri.length == 0}
                    />
                </View>

                <View style={{flex: 2}}>
                    <View style={styles.sectionTitle}>
                        <View style={{width: '90%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                            <View style={{flexDirection: 'row'}}>
                                <Text
                                    style={showTransactionsList ? styles.sectionTitleText : styles.sectionTitleTextUnselected}
                                    onPress={() => {if(!showTransactionsList) setShowTransactionsList(true)}}
                                >
                                    Transactions
                                </Text>
                                <View style={{borderRightWidth: 1, marginHorizontal: 10, borderColor: 'white'}}/>
                                <Text
                                    style={!showTransactionsList ? styles.sectionTitleText : styles.sectionTitleTextUnselected}
                                    onPress={() => {if(showTransactionsList) setShowTransactionsList(false)}}
                                >
                                    Rewards
                                </Text>
                            </View>
                           <TouchableOpacity
                                onPress={() => setShowTransactionModal(true)}
                                style={{marginRight: -5}}
                            >
                                <Ionicons
                                    name="add-circle-outline"
                                    color="white"
                                    size={30}
                                ></Ionicons>
                            </TouchableOpacity>
                        </View>
                    </View>
                    {
                        showTransactionsList ?
                        <View style={{flex:1}}>
                            {
                                ((transactions.length == 0) || !displayTransactions) ?
                                <View style={{alignItems: 'center', paddingTop: 10}}>
                                    <Text>You currently have no transactions!</Text>
                                </View>
                                :
                                <SwipeListView
                                    data={transactions}
                                    renderItem={ (data, rowMap) => {
                                        var date = data.item.dateAdded.toString().substring(0,24);
                                        var name = data.item.storeInfo.storeName;
                                        var dollarAmount = data.item.amountSpent;
                                        return (
                                        <View style={styles.rowFront}>
                                            <View style={{flexDirection: 'row', width: '90%', justifyContent: 'space-between'}}>
                                                <View style={{flexDirection: 'column'}}>
                                                    <Text style={styles.transactionTextLeft}>{name}</Text>
                                                    <Text>{date}</Text>
                                                </View>
                                                <View style={{justifyContent: 'center'}}>
                                                    <Text>${dollarAmount}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    )}}
                                    renderHiddenItem={ (data, rowMap) => (
                                        <View style={styles.rowBack}>
                                            <Text>Left</Text>
                                            <TouchableOpacity
                                                style={[styles.backRightBtn, styles.backRightBtnLeft]}
                                                onPress={() => {
                                                    setCurrentTransaction(data.item),
                                                    setShowEditTransactionModal(true),
                                                    rowMap[data.item.key].closeRow()
                                                    }}
                                            >
                                                <Ionicons
                                                    name="eyedrop-outline"
                                                    color="white"
                                                    size={25}
                                                ></Ionicons>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.backRightBtn, styles.backRightBtnRight]}
                                                onPress={() => {
                                                    setCurrentTransaction(data.item),
                                                    confirmDeleteTransaction(data.item),
                                                    rowMap[data.item.key].closeRow()
                                                    }}
                                            >
                                                <Ionicons
                                                    name="trash-outline"
                                                    color="white"
                                                    size={25}
                                                ></Ionicons>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                    rightOpenValue={-150}
                                    disableRightSwipe={true}
                                />
                            }
                        </View>
                        :
                        <ScrollView>
                        {
                            displayRewards &&
                            rewards.map((reward, i) => {
                                var category;
                                var amountCents;
                                // temporary way to tell if card is a manual addition
                                if (rewards[0][0] == '0') {
                                    category = reward[1].type;
                                    amountCents = reward[1].value;
                                } else {
                                    category = reward[0];
                                    amountCents = reward[1];
                                }

                                return (
                                    <View style={styles.sectionText} key={i}>
                                        <View style={{flexDirection: 'row', width: '90%', justifyContent: 'space-between'}}>
                                            <Text style={{ fontWeight: 'bold' }}>{category}</Text>
                                            <Text style={{ marginLeft: 5 }}>{amountCents} cents</Text>
                                        </View>
                                    </View>
                                )
                            })
                        }
                        </ScrollView>
                    }
                    
                </View>

                <View>
                    {
                        (origin !== "main") &&
                        <TouchableOpacity style={styles.deleteContainer} onPress={confirmDelete}>
                            <Text style={styles.deleteText}>Delete this card</Text>
                        </TouchableOpacity>
                    }
                </View>
            </SafeAreaView>
        // </DismissKeyboard>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        height: '100%', 
        flex: 1
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
        // height: 230, // hard coded for now
        marginBottom: 10,
        alignSelf: 'center',
    }, 
    sectionTitle: { 
        display: 'flex',
        flexDirection: 'row',
        height: 45,
        justifyContent: 'center',
        backgroundColor: '#28b573',
        alignItems: 'center'
    },
    sectionTitleText: {
        fontSize: 16,
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold'
    },
    sectionTitleTextUnselected: {
        fontSize: 16,
        color: 'lightgray',
        textAlign: 'center'
    },
    sectionTextSelected: {
        display: 'flex',
        width: '100%', 
        height: 45,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomColor: 'lightgray',
        borderBottomWidth: 1,
        backgroundColor: 'dodgerblue'
    },
    sectionText: {
        display: 'flex',
        height: 45,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomColor: 'lightgray',
        borderBottomWidth: 1,
    },
    transactionTextLeft: { 
        fontWeight : 'bold',
    },
    transactionTextRight: {
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
    },
    rowFront: {
        alignItems: 'center',
        backgroundColor: 'white',
        borderBottomColor: 'lightgray',
        borderBottomWidth: 1,
        justifyContent: 'center',
        height: 50,
    },
    rowBack: {
        alignItems: 'center',
        backgroundColor: '#DDD',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: 15,
    },
    backRightBtn: {
        alignItems: 'center',
        bottom: 0,
        justifyContent: 'center',
        position: 'absolute',
        top: 0,
        width: 75,
    },
    backRightBtnLeft: {
        backgroundColor: 'blue',
        right: 75,
    },
    backRightBtnRight: {
        backgroundColor: 'red',
        right: 0,
    },
});

export { DisplayCard };