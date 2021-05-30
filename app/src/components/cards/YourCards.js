import React from 'react';
import {
    StyleSheet, 
    View, 
    Text, 
    TouchableOpacity,
    Alert,
    Animated,
    Dimensions,
    PixelRatio,
    SafeAreaView
} from 'react-native';
import { Card } from './Card';
import { user } from '../../network/user';
import { useState, useRef, useEffect } from "react";
import { Ionicons } from '@expo/vector-icons';
import { Footer } from '../util/Footer';
import { AddCardModal } from './AddCardModal';
import { useIsFocused } from '@react-navigation/native';
import { makeCancelable } from '../util/promise-helper';
import { SwipeListView } from 'react-native-swipe-list-view';
import mainStyles from "../../styles/mainStyles"
import * as Haptics from 'expo-haptics';

const CARD_HEIGHT = (Dimensions.get('window').width * 0.9) / 1.586;

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
    const [swipeDeleteWidths, setSwipeDeleteWidths] = useState({});
    const [swipeLockWidths, setSwipeLockWidths] = useState({});
    const [swipeHeights, setSwipeHeights] = useState({});
    const [swipeOpacities, setSwipeOpacities] = useState({});
    const [rowRefs, setRowRefs] = useState({});
    const [isLoaded, setLoaded] = useState(false);
    const animationRunning = useRef(false);
    const swipeButtonOpen = useRef(false);
    const userId = user.getUserId();
    const [modalVisible, setModalVisible] = useState(false);
    const storeInformation = route.params.storeInformation;
    const forceLoad = typeof route.params.forceLoad !== "undefined" && route.params.forceLoad === true;
    const focused = useIsFocused();

    const resetAnimationValues = key => {
        if (typeof swipeDeleteWidths[key] === "undefined") {
            swipeDeleteWidths[key] = new Animated.Value(0);
            swipeLockWidths[key] = new Animated.Value(0);
            swipeHeights[key] = new Animated.Value(CARD_HEIGHT + 20 * PixelRatio.getFontScale() + 24);
            swipeOpacities[key] = new Animated.Value(1.0);
        } else {
            swipeDeleteWidths[key].setValue(0);
            swipeLockWidths[key].setValue(0);
            swipeHeights[key].setValue(CARD_HEIGHT + 20 * PixelRatio.getFontScale() + 24);
            swipeOpacities[key].setValue(1.0);
        }
    };

    useEffect(() => {
        if (isLoaded === false || forceLoad === true) {
            const cancelableGetCards = makeCancelable(user.getCards(userId));
            cancelableGetCards.promise.then(cards => {
                setCards([]);
                cards.forEach(element => {
                    element["key"] = cards.indexOf(element).toString();
                    resetAnimationValues(element["key"]);
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

    const deleteCard = (card, index) => {
        user.deleteCard(userId, card.cardId, card.docId);
        Animated.timing(swipeHeights[index], {
            toValue: 0,
            duration: 150,
            useNativeDriver: false
        }).start(() => {
            if (rowRefs[index.toString()] !== undefined) rowRefs[index.toString()].closeRow();
            let newCards = [...cards];
            for (let i = index; i < newCards.length; i++) { // recalculate keys
                newCards[i]["key"] = (parseInt(newCards[i]["key"]) - 1).toString();
            }
            newCards.splice(index, 1);
            setCards(newCards);
            resetAnimationValues(index);
        });
    }

    const lockCard = (card, index) => {
        // need card locking logic
    }
    
    const confirmDelete = (card, index) => {
        Alert.alert(
            'Delete Card?',
            'This card will be permanently deleted from your profile.',
            [
              {text: 'Delete', onPress: () => deleteCard(card, index)},
              {text: 'Cancel', onPress: () => console.log(''), style: 'cancel'},
            ]
          );
    };

    const confirmSwipeAction = (card, index) => {
        if (swipeDeleteWidths[index].__getValue() === 0) lockCard(card, index);
        else confirmDelete(card, index);
    }

    if (cards.length == 0) {
        return (
            <SafeAreaView style={mainStyles.screen}>
                <View style={mainStyles.bodyContainer}>
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

    const swipeThreshold = Dimensions.get('window').width * 0.5;
    const onSwipeValueChange = swipeData => {
        const { key, value } = swipeData;
        let deleteFlag = value < 0;
        // reset the widths if not visible
        if (deleteFlag) swipeLockWidths[key].setValue(0);
        else swipeDeleteWidths[key].setValue(0);
        if (Math.abs(value) > swipeThreshold) {
            if (!animationRunning.current && !swipeButtonOpen.current) {
                // https://docs.expo.io/versions/latest/sdk/haptics/
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Animated.timing(swipeOpacities[key], {
                    toValue: 0.0,
                    duration: 100,
                    useNativeDriver: false
                }).start();
                Animated.timing(deleteFlag ? swipeDeleteWidths[key] : swipeLockWidths[key], {
                    toValue: Dimensions.get('window').width * 0.9,
                    duration: 150,
                    useNativeDriver: false
                }).start(() => {
                    animationRunning.current = false;
                    swipeButtonOpen.current = true;
                    swipeOpacities[key].setValue(0.0);
                });
                animationRunning.current = true;
            }
        } else {
            if (!animationRunning.current && swipeButtonOpen.current) {
                // https://docs.expo.io/versions/latest/sdk/haptics/
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Animated.timing(swipeOpacities[key], {
                    toValue: 1.0,
                    duration: 100,
                    useNativeDriver: false
                }).start();
                Animated.timing(deleteFlag ? swipeDeleteWidths[key] : swipeLockWidths[key], {
                    toValue: Math.abs(value),
                    duration: 150,
                    useNativeDriver: false
                }).start(() => {
                    animationRunning.current = false;
                    swipeButtonOpen.current = false;
                    swipeOpacities[key].setValue(1.0);
                });
                animationRunning.current = true;
            } else if (!animationRunning.current) {
                if (deleteFlag) swipeDeleteWidths[key].setValue(Math.abs(value));
                else swipeLockWidths[key].setValue(Math.abs(value));
            }
        }
    };

    const swipeGestureEnded = (key, data) => {
        if (Math.abs(data.translateX) > swipeThreshold) {
            let index = parseInt(key);
            if (data.translateX < 0) deleteCard(cards[index], index);
            else lockCard(cards[index], index);
        }
    };

    const onRowOpen = (rowKey, rowMap) => {
        rowRefs[rowKey] = rowMap[rowKey]; // hacky
        setRowRefs(rowRefs);
    };

    const onRowClose = (rowKey, rowMap) => {
        rowRefs[rowKey] = undefined; // hacky
        setRowRefs(rowRefs);
    };

    return (
        <SafeAreaView style={mainStyles.screen}>
            <View style={mainStyles.bodyContainer}>
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

                <View style={{flex: 1}}>
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
                                <View style={{paddingHorizontal: '5%'}}>
                                    <Animated.View key={data.item.docId} style={{ opacity: swipeOpacities[data.item.key], height: swipeHeights[data.item.key], overflow: "hidden" }}>
                                        <Card key={data.item.docId} props={props} />
                                    </Animated.View>
                                    {data.item.key < cards.length-1 && // render divider bar for all cards except for last card
                                        <View style={styles.divider}></View>
                                    }
                                </View>
                            )
                        }}
                        renderHiddenItem={(data, rowMap) => (
                            <Animated.View style={{ height: swipeHeights[data.item.key], overflow: "hidden" }}>
                                <View style={styles.cardBackWrapper}>
                                    <TouchableOpacity style={styles.cardBack} onPress={() => confirmSwipeAction(data.item, cards.indexOf(data.item))}>
                                        <Animated.View style={[styles.cardDelete, { width: swipeDeleteWidths[data.item.key] }]}>
                                            <Ionicons
                                                name="trash-outline"
                                                color="white"
                                                size={25}
                                            ></Ionicons>
                                        </Animated.View>
                                        <Animated.View style={[styles.cardLock, { width: swipeLockWidths[data.item.key] }]}>
                                            <Ionicons
                                                name="eye-off-outline"
                                                color="white"
                                                size={25}
                                            ></Ionicons>
                                        </Animated.View>
                                    </TouchableOpacity>
                                </View>
                            </Animated.View>
                        )}
                        rightOpenValue={-100}
                        leftOpenValue={100}
                        disableRightSwipe={true} // comment this out to enable lock swiping
                        onSwipeValueChange={onSwipeValueChange}
                        swipeGestureEnded={swipeGestureEnded}
                        onRowOpen={onRowOpen}
                        onRowClose={onRowClose}
                        useNativeDriver={false}
                    />
                </View>                
            </View>
            <View style={[{shadowColor: "white", shadowOffset: { width: 0, height: -6 }, shadowOpacity: 1.0, shadowRadius: 3.00}, 
                          mainStyles.footerContainer]}>
                <Footer navigation={navigation} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    emptyBodyContainer: {
        flex: 1,
        alignItems: "center"
    },
    addButton: {
        borderRadius: 100,
        paddingHorizontal: 5,
        alignSelf: 'flex-end',
        margin: 8,
        marginBottom: 0,
    },
    divider: { 
        width: '100%',
        borderWidth: 1,
        borderColor: 'lightgray',
        marginTop: 10
    },
    cardBackWrapper: {
        height: "100%",
        flexDirection: "row",
        paddingHorizontal: (Dimensions.get('window').width * 0.05),
    },
    cardBack: {
        width: "100%",
        height: CARD_HEIGHT,
        alignSelf: "flex-end",
        flexDirection: "row-reverse",
        justifyContent: "space-between"
    },
    cardDelete: {
        height: "100%",
        backgroundColor: 'red',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 15,
    },
    cardLock: {
        height: "100%",
        backgroundColor: 'orange',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 15,
    }
});

export { YourCards };