import React from 'react';
import { 
    SafeAreaView, 
    ScrollView, 
    StyleSheet, 
    View, 
    Text, 
    TouchableOpacity, 
    StatusBar 
} from 'react-native';
import { Card } from './Card';
import { user } from '../../network/user';
import { useState, useEffect } from "react";
import { Ionicons } from '@expo/vector-icons';
import { Footer } from '../util/Footer';
import { AddCardModal } from './AddCardModal'
import { useIsFocused } from '@react-navigation/native'
import { makeCancelable } from '../util/promise-helper';

/**
 * Display all of the credit cards associated with a user's account in a scrollable and selectable view. 
 * Shows each credit card's name and a picture of the card. If not card image is found, a gradient/colorized
 * image will be displayed instead.
 * 
 * @param {{Object, Object}} obj - The route and navigation passed directly to display card
 * @param {Object} obj.route - routing object containing information about a specific store
 * @param {Object} obj.navigation - navigation object used to move between different pages
 * @module YourCards
 */
function YourCards({ route, navigation }) {
    const [cards, setCards] = useState([]);
    const userId = user.getUserId();
    const [modalVisible, setModalVisible] = useState(false);
    const storeInformation = route.params.storeInformation;
    const focused = useIsFocused();

    const cancelableGetCards = makeCancelable(user.getCards(userId));
    useEffect(() => {
        cancelableGetCards.promise.then(cards => {
            setCards([]);
            setCards(cards); 
        }).catch(({isCanceled, ...error}) => {});

        return () => {
            cancelableGetCards.cancel();
        }
    }, [focused])



    // const focused = useIsFocused();

    // // const cancelableGetCards = makeCancelable(user.getCards(userId));
    // // const cancelableInitCards = makeCancelable(user.initializeCards(userId));

    // // Initialize cards by rectifying firebase and local collection on startup, 
    // // and after initialization, gets local cards
    // const [cardsAreUpdated, setCardsAreUpdated] = useState(false);
    // useEffect(()=> {
    //     // console.log(cardsAreUpdated);
    //     // cards only from local
    //     // if (cardsAreUpdated) {
    //         cancelableGetCards.promise.then(cards => {
    //             setCards([]);
    //             setCards(cards);
    //         }).catch(({ isCanceled, ...error }) => { });

    //         // return () => {
    //             // cancelableGetCards.cancel();
    //         // }
    //     // get cards from firebase and local 
    //     // } else {   
    //         // console.log('line 57') 
    //         // setCardsAreUpdated(true);

    //         // user.initializeCards(userId);

    //         // cancelableInitCards.promise.then(cards => { 
    //         //     console.log('got cards:')
    //         //     console.log(cards);
    //         //     console.log('\n\n')

    //         //     setCards([])
    //         //     setCards(cards);
    //         // }).catch(({ isCanceled, ...error }) => { });

    //         // return () => {
    //         //     cancelableInitCards.cancel();
    //         // }
    //     // }
    // }, [focused])

    // TODO: need to add loading screen 

    if (cards.length == 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.bodyContainer}>
                    <AddCardModal
                        navigation={navigation}
                        modalVisible={modalVisible}
                        setModalVisible={setModalVisible}
                    />

                    <View style={styles.addButton}>
                        <TouchableOpacity onPress={() => setModalVisible(true)}>
                            <Ionicons
                                name="add-circle-outline"
                                color="black"
                                size={32}
                            ></Ionicons>
                        </TouchableOpacity>
                    </View>

                    <Text style={{ marginTop: 40, fontSize: 18 }}>You currently have no stored cards!</Text>
                </View>
                <View style={styles.footerContainer}>
                    <Footer navigation={navigation} />
                </View>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.bodyContainer}>
                <AddCardModal
                    navigation={navigation}
                    modalVisible={modalVisible}
                    setModalVisible={setModalVisible}
                />
                <View style={styles.addButton}>
                    <TouchableOpacity onPress={() => setModalVisible(true)}>
                        <Ionicons
                            name="add-circle-outline"
                            color="black"
                            size={32}
                        ></Ionicons>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.scrollView}>
                    <View>
                        {cards.map((card, i) => {
                            var props = {
                                navigation: navigation,
                                card: card,
                                storeInformation: storeInformation,
                                origin: "yourcards"
                            }
                            return (
                                <View>
                                    <Card key={i.toString()} props={props} />
                                    <View style={styles.divider}></View>
                                </View>
                            )
                        })}
                   </View>

                    {/* Below is empty height at bottom of scrollview because absolute footer cuts it off */}
                    <View style={{ height: 100 }}></View>
                </ScrollView>
            </View>
            <View style={styles.footerContainer}>
                <Footer navigation={navigation} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: 'white',
        height: '100%',
        paddingTop: StatusBar.currentHeight
    },
    container : {
        flex: 1,
        backgroundColor: 'white',
        height: '100%',
        display: 'flex',
        justifyContent: 'space-between', 
        paddingTop: StatusBar.currentHeight,
    },
    bodyContainer: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    scrollView: {
        width: "90%"
    },
    addButton: {
        borderRadius: 100,
        padding: 5,
        alignSelf: 'flex-end',
        margin: 8,
        marginBottom: 0
    },
    footerContainer: {
        width: '100%',
        backgroundColor: 'white',
        position: 'absolute',
        bottom: 0,
        paddingBottom: 35,
    },
    divider: { 
        width: '100%',
        borderWidth: 1,
        borderColor: 'lightgray'
    }
});

export { YourCards };