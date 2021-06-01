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
import { useIsFocused, StackActions } from '@react-navigation/native';
import { makeCancelable } from '../util/promise-helper';
import { SwipeListView } from 'react-native-swipe-list-view';
import mainStyles from "../../styles/mainStyles"
import * as Haptics from 'expo-haptics';
import * as storage from '../../local/storage';

// the card height found using a ratio
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
    const [cards, setCards] = useState([]); // the current cards list
    const [swipeDeleteWidths, setSwipeDeleteWidths] = useState({}); // the swipe button widths (for delete)
    const [swipeLockWidths, setSwipeLockWidths] = useState({}); // the swipe button widths (for lock)
    const [swipeHeights, setSwipeHeights] = useState({}); // the swipe button heights
    const [swipeOpacities, setSwipeOpacities] = useState({}); // the card opacities (for swipe)
    const rowRefs = useRef({}); // the row references for swipeable cards
    const [isLoaded, setLoaded] = useState(false); // whether this page was loaded already or not
    const animationRunning = useRef(false); // whether there is an animation currently running
    const swipeButtonOpen = useRef(false); // whether a swipe button is currently open
    const userId = user.getUserId(); // get the user id
    const [modalVisible, setModalVisible] = useState(false);
    const storeInformation = route.params.storeInformation;
    const forceLoad = ((typeof route.params.forceLoad !== "undefined") && (route.params.forceLoad === true));
    const focused = useIsFocused();
    const [cardToEnableDisable, setCardToEnableDisable] = useState(null);

    const resetAnimationValues = key => {
        if (typeof swipeDeleteWidths[key] === "undefined") { // if they don't exist, create them
            swipeDeleteWidths[key] = new Animated.Value(0);
            swipeLockWidths[key] = new Animated.Value(0);
            swipeHeights[key] = new Animated.Value(CARD_HEIGHT + 20 * PixelRatio.getFontScale() + 24);
            swipeOpacities[key] = new Animated.Value(1.0);
        } else { // set to their defaults if they do exist
            swipeDeleteWidths[key].setValue(0);
            swipeLockWidths[key].setValue(0);
            swipeHeights[key].setValue(CARD_HEIGHT + 20 * PixelRatio.getFontScale() + 24);
            swipeOpacities[key].setValue(1.0);
        }
    };

    // react native use effect for the 'OnFocus' action
    useEffect(() => {
        if (isLoaded === false || forceLoad === true) { // whether a force load or if not loaded yet
            // load the cards in
            const cancelableGetCards = makeCancelable(user.getCards(userId));
            cancelableGetCards.promise.then(cards => {
                setCards([]);
                cards.forEach(element => { // add a "key" for each for SwipeListView support
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

    // delete card function with animation
    const deleteCard = (card, index) => {
        user.deleteCard(userId, card.cardId, card.docId); // delete from the user
        // animate the delete
        Animated.timing(swipeHeights[index], {
            toValue: 0,
            duration: 150,
            useNativeDriver: false
        }).start(() => {
            if (rowRefs.current[index.toString()] !== undefined) rowRefs.current[index.toString()].closeRow();
            let newCards = [...cards];
            for (let i = index; i < newCards.length; i++) { // recalculate keys
                newCards[i]["key"] = (parseInt(newCards[i]["key"]) - 1).toString();
            }
            newCards.splice(index, 1);
            setCards(newCards);
            resetAnimationValues(index);
        });
    }

    // lock a card
    const lockCard = (card, index) => {
        if (card !== null) {
            // disable the card for the user
            storage.setDisabledCards(card.cardId);
            user.setMainNeedsUpdate(true);
            setTimeout(() => {
                if (rowRefs.current[index.toString()] !== undefined) rowRefs.current[index.toString()].closeRow();
            }, 150);
            // Force a a new YourCards to replace the current YourCards to trigger re-render
            // Might not be the best
            // navigation.dispatch(
            //     StackActions.replace('YourCards', {})
            // );
            setCardToEnableDisable(card.cardId);
            console.log("Change card " + card.cardId);
            // rowRefs[index.toString()].closeRow();
        }
    }
    
    // confirmation for deletion using an Alert
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

    // confirmation for when a swipe button is clicked
    const confirmSwipeAction = (card, index) => {
        // choose a swipe action depending on the width of the delete button
        if (swipeDeleteWidths[index].__getValue() === 0) lockCard(card, index);
        else confirmDelete(card, index);
    }

    // No cards, render empty
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
                    <Text style={{ paddingTop: "50%", fontSize: 18 }}>No cards yet.</Text>
                    </View>
                </View>
                <View style={styles.footerContainer}>
                    <Footer navigation={navigation} />
                </View>
            </SafeAreaView>
        )
    }

    // calculate the swipe threshold to be 50% of the width of the screen
    const swipeThreshold = Dimensions.get('window').width * 0.5;
    const onSwipeValueChange = swipeData => {
        const { key, value } = swipeData;
        let deleteFlag = value < 0; // flag for deletion (left swipe)
        // reset the widths if not visible
        if (deleteFlag) swipeLockWidths[key].setValue(0);
        else swipeDeleteWidths[key].setValue(0);
        if (Math.abs(value) > swipeThreshold) {
            if (!animationRunning.current && !swipeButtonOpen.current) {
                // https://docs.expo.io/versions/latest/sdk/haptics/
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                // animate to hide the card
                Animated.timing(swipeOpacities[key], {
                    toValue: 0.0,
                    duration: 100,
                    useNativeDriver: false
                }).start();
                // animate to make the button in full view
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
                // animate to make card visible again
                Animated.timing(swipeOpacities[key], {
                    toValue: 1.0,
                    duration: 100,
                    useNativeDriver: false
                }).start();
                // spring back to what it was before
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
                // keep updating the width for smooth
                if (deleteFlag) swipeDeleteWidths[key].setValue(Math.abs(value));
                else swipeLockWidths[key].setValue(Math.abs(value));
            }
        }
    };

    const swipeGestureEnded = (key, data) => {
        // detect when past theswipe threshold
        if (Math.abs(data.translateX) > swipeThreshold) {
            let index = parseInt(key);
            if (data.translateX < 0) deleteCard(cards[index], index);
            else lockCard(cards[index], index);
        }
    };

    const onRowOpen = (rowKey, rowMap) => {
        rowRefs.current[rowKey] = rowMap[rowKey]; // hacky update of the rowRefs
        // console.log("hi");
        // console.log(rowRefs);
    };

    const onRowClose = (rowKey, rowMap) => {
        rowRefs.current[rowKey] = undefined; // hacky update of the rowRefs
    };

    // render the cards
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
                        renderItem={(data, rowMap) => (
                            <View style={{paddingHorizontal: '5%'}}>
                                <Animated.View key={data.item.docId} style={{ opacity: swipeOpacities[data.item.key], height: swipeHeights[data.item.key], overflow: "hidden" }}>
                                    <Card
                                        key={data.item.docId}
                                        navigation={navigation}
                                        card={data.item}
                                        storeInformation={storeInformation}
                                        origin={"yourcards"}
                                        cardToEnableDisable = {cardToEnableDisable}
                                        setCardToEnableDisable = {setCardToEnableDisable}
                                    />
                                </Animated.View>
                                { /* render divider bar for all cards except for last card */ }
                                <View style={data.item.key < cards.length-1 ? styles.divider : [styles.divider, { opacity: 0 }]}></View>
                            </View>
                        )}
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
                                                name="lock-closed-outline"
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

// the styles for this component
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