import React from 'react';
import { 
    SafeAreaView, 
    StyleSheet, 
    View, 
    Text, 
    TouchableOpacity, 
    StatusBar,
    Alert,
    Animated,
    Dimensions,
    PixelRatio
} from 'react-native';
import { Card } from './Card';
import { user } from '../../network/user';
import { useState, useRef, useEffect } from "react";
import { Ionicons } from '@expo/vector-icons';
import { Footer } from '../util/Footer';
import { AddCardModal } from './AddCardModal'
import { useIsFocused } from '@react-navigation/native'
import { makeCancelable } from '../util/promise-helper';
import { SwipeListView } from 'react-native-swipe-list-view';

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
    const [swipeWidths, setSwipeWidths] = useState([]);
    const [swipeOpacities, setSwipeOpacities] = useState([]);
    const [isLoaded, setLoaded] = useState(false);
    const animationRunning = useRef(false);
    const deleteOpen = useRef(false);
    const userId = user.getUserId();
    const [modalVisible, setModalVisible] = useState(false);
    const storeInformation = route.params.storeInformation;
    const forceLoad = typeof route.params.forceLoad !== "undefined" && route.params.forceLoad === true;
    const focused = useIsFocused();

    const resetSwipeWidth = key => {
        if (typeof swipeWidths[key] === "undefined") {
            swipeWidths[key] = new Animated.Value(0);
            swipeOpacities[key] = new Animated.Value(1.0);
        } else {
            swipeWidths[key].setValue(0);
            swipeOpacities[key].setValue(1.0);
        }
        setSwipeWidths(swipeWidths);
        setSwipeOpacities(swipeOpacities);
    };

    useEffect(() => {
        if (isLoaded === false || forceLoad === true) {
            const cancelableGetCards = makeCancelable(user.getCards(userId));
            cancelableGetCards.promise.then(cards => {
                setCards([]);
                cards.forEach(element => {
                    element["key"] = cards.indexOf(element);
                    resetSwipeWidth(element["key"]);
                });
                setCards(cards);
            }).catch(({isCanceled, ...error}) => {});
    
            setLoaded(true);
            route.params.forceLoad = false; // hacky

            return () => {
                cancelableGetCards.cancel();
            }
        }
    }, [focused])

    const deleteCard = (rowMap, card, index) => {
        if (rowMap !== null) rowMap[index].closeRow();
        user.deleteCard(userId, card.cardId, card.docId);
        let newCards = [...cards];
        for (let i = index; i < newCards.length; i++) { // recalculate keys
            newCards[i]["key"]--;
        }
        newCards.splice(index, 1);
        setCards(newCards);
        resetSwipeWidth(index);
    }
    
    const confirmDelete = (rowMap, card, index) => {
        Alert.alert(
            'Delete Card?',
            'This card will be permanently deleted from your profile.',
            [
              {text: 'Delete', onPress: () => deleteCard(rowMap, card, index)},
              {text: 'Cancel', onPress: () => console.log(''), style: 'cancel'},
            ]
          );
    };

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

                    <View style={styles.emptyBodyContainer}>
                    <   Text style={{ paddingTop: "50%", fontSize: 18 }}>No cards yet.</Text>
                    </View>
                </View>
                <View style={styles.footerContainer}>
                    <Footer navigation={navigation} />
                </View>
            </SafeAreaView>
        )
    }

    const deleteThreshold = Dimensions.get('window').width * -0.5; 
    const onSwipeValueChange = swipeData => {
        const { key, value } = swipeData;
        if (value < deleteThreshold) {
            if (!animationRunning.current && !deleteOpen.current) {
                Animated.timing(swipeOpacities[key], {
                    toValue: 0.0,
                    duration: 100,
                    useNativeDriver: false
                }).start();
                Animated.timing(swipeWidths[key], {
                    toValue: Dimensions.get('window').width * 0.9,
                    duration: 150,
                    useNativeDriver: false
                }).start(() => {
                    animationRunning.current = false;
                    deleteOpen.current = true;
                    swipeOpacities[key].setValue(0.0);
                });
                animationRunning.current = true;
            }
        } else {
            if (!animationRunning.current && deleteOpen.current) {
                Animated.timing(swipeOpacities[key], {
                    toValue: 1.0,
                    duration: 100,
                    useNativeDriver: false
                }).start();
                Animated.timing(swipeWidths[key], {
                    toValue: Math.abs(value),
                    duration: 150,
                    useNativeDriver: false
                }).start(() => {
                    animationRunning.current = false;
                    deleteOpen.current = false;
                    swipeOpacities[key].setValue(1.0);
                });
                animationRunning.current = true;
            } else if (!animationRunning.current) {
                swipeWidths[key].setValue(Math.abs(value));
            }
        }
        setSwipeWidths(swipeWidths);
        setSwipeOpacities(swipeOpacities);
    };

    const swipeGestureEnded = (key, data) => {
        if (data.translateX < deleteThreshold) {
            deleteCard(null, cards[key], key);
        }
    };

    const onRowOpen = (rowKey, rowMap) => {
        if (swipeWidths[rowKey].__getValue() === 0) rowMap[rowKey].closeRow(); // really hacky
    };

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

                <View style={{height: "100%"}}>
                    <SwipeListView
                        data={cards}
                        renderItem={(data, rowMap) => {
                            var props = {
                                navigation: navigation,
                                card: data.item,
                                storeInformation: storeInformation,
                                origin: "yourcards"
                            }
                            return (
                                <Animated.View key={data.item.docId} style={{ opacity: swipeOpacities[data.item.key] }}>
                                    <Card key={data.item.docId} props={props} />
                                    <View style={styles.divider}></View>
                                </Animated.View>
                            )
                        }}
                        renderHiddenItem={(data, rowMap) => (
                            <TouchableOpacity style={styles.cardBack} onPress={() => confirmDelete(rowMap, data.item, cards.indexOf(data.item))}>
                                <Animated.View style={[styles.cardDelete, { width: swipeWidths[data.item.key] }]}>
                                    <Ionicons
                                        name="trash-outline"
                                        color="white"
                                        size={25}
                                    ></Ionicons>
                                </Animated.View>
                            </TouchableOpacity>
                        )}
                        rightOpenValue={-100}
                        disableRightSwipe={true}
                        onSwipeValueChange={onSwipeValueChange}
                        swipeGestureEnded={swipeGestureEnded}
                        onRowOpen={onRowOpen}
                        useNativeDriver={false}
                    />
                </View>                
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
    emptyBodyContainer: {
        height: "100%",
        alignItems: "center"
    },
    bodyContainer: {
        height: "100%",
        paddingBottom: 100
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
    },
    cardBack: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingTop: 20 * PixelRatio.getFontScale() + 24,
        marginRight: (Dimensions.get('window').width * 0.05)
    },
    cardDelete: {
        backgroundColor: 'red',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 15,
        height: (Dimensions.get('window').width * 0.9) / 1.586
    }
});

export { YourCards };