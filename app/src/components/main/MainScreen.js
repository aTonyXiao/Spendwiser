import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Button, Image, Dimensions, TouchableOpacity, ScrollView, SafeAreaView, Modal, StatusBar } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { TextInput } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import { recommendCard } from './RecommendCard';
import { Footer } from '../util/Footer';
import { user } from '../../network/user';
import Carousel, { Pagination } from 'react-native-snap-carousel'
import { cards } from '../../network/cards';

const googlePlaceSearchURL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location="
const googlePlaceSearchRadius = "&radius=100&key="
const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;
const itemWidth = Math.round(width * 0.7);
const slideHeight = Math.round(height * 0.3);
const itemHorizontalMargin = Math.round(width / 50);
const entryBorderRadius = 8;

export function MainScreen({navigation}) {
    const [errorMsg, setErrorMsg] = useState(null);
    const [region, setRegion] = useState({
        latitude: 38.542530, 
        longitude: -121.749530,
        latitudeDelta: 0.0052,
        longitudeDelta: 0.0051,
    })
    const [isLoading, setLoading] = useState(true);
    const [places, setPlaces] = useState([]);
    const [amountSpent, setAmountSpent] = useState("");
    const [storeArr, setStoreArr] = useState([]);
    const [curStore, setCurStore] = useState(null);
    const [curStoreKey, setCurStoreKey] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [manualInput, setManualInput] = useState({storeName: "", vicinity: "", storeType: ""});
    const [recCards, setRecCards] = useState(null);
    const [recIdx, setRecIdx] = useState(0);
    const ref = useRef(null);
    const userId = user.getUserId();
    const [manualModal, setManualModal] = useState(false);
      
    function setOfflineMode() {
        setStoreArr([{
            label: "Offline Mode",
            value: "Offline Mode",
            vicinity: "N/A",
            storeType: "N/A", 
            key: 0,
        }])
        setCurStore("Offline Mode");
        setCurStoreKey(0);
    }

    function getRecCardFromDB(myRankedCards) {
        setRecCards(myRankedCards)
        console.log(myRankedCards)
    }

    function changeRecCard(value, key) {
        if (key !== curStoreKey) {
            let category = storeArr[key]["storeType"];
            // console.log("change rec card -> store name: " + storeArr[key]["value"] + " store type: " + storeArr[key]["storeType"]);
            recommendCard.getRecCards(category, getRecCardFromDB);
            setCurStore(value);
            setCurStoreKey(key);
        }
    }

    function reloadRecCard() {
        if (storeArr[curStoreKey] !== undefined) {
            let category = storeArr[curStoreKey]["storeType"];
            // console.log("change rec card -> store name: " + storeArr[key]["value"] + " store type: " + storeArr[key]["storeType"]);
            recommendCard.getRecCards(category, getRecCardFromDB);
        } else {
            changeRecCard(curStore, curStoreKey);
        }
    }

    function getLocationFromAPI(json) {
        setPlaces(json.results);
        let fetchResult = json.results;
        let fetchStores = [];

        if (fetchResult == undefined || fetchResult.length == 0) {
            return;
        }
        let addCount = 0;
        let fetchResultLen = Object.keys(fetchResult).length - 1;
        for (let i = 0; i < fetchResultLen; i++) {
            if (i === fetchResultLen) {
                break;
            }
            if (fetchResult[i].types.includes("locality")) {
                continue;
            } else {
                let storeType = JSON.stringify(fetchResult[i].types[0]).slice(1,-1).replace(/_/g, " ");
                storeType = storeType.charAt(0).toUpperCase() + storeType.slice(1)
                fetchStores.push({
                    label: JSON.stringify(fetchResult[i].name).slice(1,-1),
                    value: JSON.stringify(fetchResult[i].name).slice(1,-1),
                    vicinity: JSON.stringify(fetchResult[i].vicinity).slice(1,-1),
                    storeType: storeType, 
                    key: addCount,
                })
                if (addCount == 0) {
                    console.log("Attempting to set the CurStore state...");
                    setCurStore(JSON.stringify(fetchResult[i].name).slice(1,-1));
                    setCurStoreKey(0);
                    recommendCard.getRecCards(storeType, getRecCardFromDB);
                }
                addCount++;
            }
        }
        console.log("Attempting to set the StoreArr...")
        setStoreArr(fetchStores);
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            if (user.getMainNeedsUpdate()) {
                /* triggered on a reload of the page */
                setRecCard(null);
                setRecCards(null);
                reloadRecCard();
                user.setMainNeedsUpdate(false);
            }
        });
        return unsubscribe;
    }, [navigation]);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            try {
                let location = await Location.getCurrentPositionAsync({});
                setRegion({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.0052,
                    longitudeDelta: 0.0051,
                })

                NetInfo.fetch().then(state => {
                    // If connected to internet, query API for nearby stores. Else: set offline mode
                    if (state.isConnected) {
                        fetch(googlePlaceSearchURL + 
                            location.coords.latitude + "," + location.coords.longitude + 
                            googlePlaceSearchRadius + process.env.REACT_NATIVE_PLACE_SEARCH_API_KEY)
                        .then((response) => response.json())
                        .then((json) => {getLocationFromAPI(json)})
                        .catch((error) => console.log(error))
                        .finally(() => setLoading(false));
                    } else {
                        setOfflineMode();
                        setLoading(false);
                        // console.log(storeArr);
                    }
                  });
            } catch(e) {
                setOfflineMode();
                setLoading(false);
                // console.log(storeArr);
                return;
            }
        })();
    }, []);
    
    recommendedCardPressed = (item) => {
        if (item !== null) {
            navigation.navigate('CardInfo', {
                cardId: item.cardId,
                docId: item.docId,
                storeInformation: storeArr[curStoreKey],
                img: { uri: item.cardImg },
            })
        }
    };
    
    const renderItem = useCallback(({ item, index }) => (
        <TouchableOpacity
              activeOpacity={1}
              style={styles.slideInnerContainer}
              onPress={() => { recommendedCardPressed(item) }}
              >
            <View style={styles.imageContainer}>
                <Image source = {{uri: item.cardImg}}
                    style = {{ 
                        width: width * .8,  //its same to '20%' of device width
                        aspectRatio: 1.5, // <-- this
                        resizeMode: 'contain', //optional
                    }}
                />
            </View>
        </TouchableOpacity>
      ), []);

    return (
        <SafeAreaView style={styles.screen}>
            {/* Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                backdropOpacity={0.3}
                visible={modalVisible}
            >
                <View style={modalStyles.modalCenteredView}>
                    <View style={modalStyles.modalView}>

                        {/* Modal header */}
                        <View style={modalStyles.modalHeader}>
                            <TouchableOpacity onPress={() => {setModalVisible(false); setManualModal(false)}}>
                                <Ionicons
                                    name="close-circle-outline"
                                    color="black"
                                    size={26}
                                ></Ionicons>
                            </TouchableOpacity>
                            {
                                !manualModal &&
                                <TouchableOpacity onPress={() => setManualModal(true)}>
                                    <Text style={modalStyles.manualModalSwitchText}>Don't see your store?</Text>
                                </TouchableOpacity>
                            }
                            {
                                manualModal &&
                                <TouchableOpacity onPress={() => setManualModal(false)}>
                                    <Text style={modalStyles.manualModalSwitchText}>Select from store list</Text>
                                </TouchableOpacity>
                            }
                        </View>

                        {/* Modal body */}
                        {/* Pick from store list */}
                        {
                            !manualModal &&
                            <View>
                                {
                                    storeArr.map((store, i) => { 
                                        var storeName = store.value;
                                        var storeIsSelected = (storeName == curStore);
                                        return (
                                            <TouchableOpacity 
                                                key={i}
                                                onPress={()=> {
                                                    setRecCards(null);
                                                    changeRecCard(storeName, i);
                                                    setModalVisible(false);
                                                }}
                                            >
                                                <Text style={storeIsSelected ? modalStyles.storeTextSelected : modalStyles.storeText}>
                                                        {storeName}
                                                </Text>
                                            </TouchableOpacity>
                                        )
                                    })
                                }
                            </View>
                        }

                        {/* Manual store input */}
                        {
                            manualModal &&
                            <View>
                                <Text style={modalStyles.manualTitle}>Input the store near you</Text>
                                <TextInput
                                    style={modalStyles.manualTextInput}
                                    onChangeText={text => {
                                        setManualInput((prevState) => {
                                            return { ...prevState, storeName: text };
                                        })
                                    }}
                                    value={manualInput.storeName}
                                    placeholder={"Store Name (Optional)"}
                                />
                                <TextInput
                                    style={modalStyles.manualTextInput}
                                    onChangeText={text => {
                                        setManualInput((prevState) => {
                                            return { ...prevState, vicinity: text };
                                        })
                                    }}
                                    value={manualInput.vicinity}
                                    placeholder={"Address (Optional)"}
                                />
                                {/* TODO: I think category should be a dropdown? */}
                                <TextInput
                                    style={modalStyles.manualTextInput}
                                    onChangeText={text => {
                                        setManualInput((prevState) => {
                                            return { ...prevState, storeType: text };
                                        })
                                    }}
                                    value={manualInput.storeType}
                                    placeholder={"Category (Required)"}
                                />
                                <Button
                                    onPress={() => {
                                        setModalVisible(!modalVisible);
                                        if (manualInput.storeType.length != 0) {
                                            let storeArrLen = (storeArr.length).toString();
                                            console.log(storeArrLen);
                                            let manualInputObj = {
                                                label: manualInput.storeName.length === 0 ? "Manual Input " + storeArrLen : manualInput.storeName,
                                                value: manualInput.storeName.length === 0 ? "Manual Input " + storeArrLen : manualInput.storeName,
                                                vicinity: manualInput.storeName.vicinity === 0 ? "N/A" : manualInput.vicinity,
                                                store_type: manualInput.storeType,
                                                key: Object.keys(storeArr).length - 1,
                                            }
                                            setStoreArr(storeList => storeList.concat(manualInputObj));
                                            setCurStore(manualInput.storeName.length === 0 ? "Manual Input " + storeArrLen : manualInput.storeName);
                                            setCurStoreKey(Object.keys(storeArr).length - 1);
                                        }
                                    }}
                                    title="Set"
                                    style={{ margin: 10 }}
                                ></Button>
                            </View>
                        }
                    </View>
                </View>
            </Modal>

            {/* Map */}
            <View style={mapStyles.mapContainer}>
                <MapView 
                    style={mapStyles.map}
                    provider="google"
                    region = {region}
                >
                    <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }} />
                </MapView>
            </View>

            {/* Location text */}
            <View style={mapStyles.textContainer}>
                <View style={mapStyles.locationTextContainer}>
                    <Text>{isLoading? "Loading" : curStore}</Text>
                    <Text>
                        {isLoading ? "" : storeArr[curStoreKey].vicinity}
                    </Text>
                    <Text>
                        {"Category: " + (isLoading ? "" : storeArr[curStoreKey].storeType)}
                    </Text>
                </View>

                <TouchableOpacity 
                    style={mapStyles.changeLocationButton}
                    onPress={() => setModalVisible(true)}
                >
                    <Text style={mapStyles.changeLocationButtonText}>Change Location</Text>
                </TouchableOpacity>
            </View>

            {/* Recommended Card */}
            <View style={styles.cardContainer}>
                <Text style={{fontSize: 17, paddingTop: 30}}>Your Recommended Card</Text>
                {recCards == null ?
                    <Image source = {require("../../../assets/load.jpg")}
                        style = {{ 
                            width: width * .8,  //its same to '20%' of device width
                            aspectRatio: 1.5, // <-- this
                            resizeMode: 'contain', //optional
                        }}
                    />
                    :
                    <View>
                        <Carousel
                            layout={"default"}
                            ref={ref}
                            data={recCards}
                            sliderWidth={width}
                            itemWidth={itemWidth}
                            renderItem={renderItem}
                            inactiveSlideScale={0.7}
                            inactiveSlideOpacity={0.7}
                            containerCustomStyle={styles.slider}
                            contentContainerCustomStyle={styles.sliderContentContainer}
                            onSnapToItem={(index) => setRecIdx(index)}
                        />
                        <Pagination
                            dotsLength={recCards.length}
                            activeDotIndex={recIdx}
                            dotColor={"green"}
                            containerStyle={{paddingVertical:0}}
                            dotContainerStyle={{marginHorizontal:3}}
                            dotStyle={styles.paginationDot}
                            inactiveDotColor={"black"}
                            inactiveDotOpacity={0.4}
                            inactiveDotScale={0.7}
                        />
                    </View>
                }
            </View>
            <Footer navigation={navigation} storeInformation={storeArr[curStoreKey]}/>
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
    loc: {
        marginTop: 20,
        flex: 1,
        justifyContent: 'space-between',
    },
    loc_name: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    cardContainer: {
        flex: 5,
        alignItems: 'center',
        justifyContent: 'center'
    },
    slider: {
        marginTop: 5,
        flexGrow: 0,
        overflow: 'visible', // for custom animations
    },
    sliderContentContainer: {
        paddingVertical: 0, // for custom animation
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 1
    },
    slideInnerContainer: {
        width: itemWidth,
        height: slideHeight,
        alignItems: 'center',
        paddingHorizontal: itemHorizontalMargin,
        // paddingBottom: 18 // needed for shadow
    },
    imageContainer: {
        flex: 1,
        backgroundColor: 'white',
        borderTopLeftRadius: entryBorderRadius,
        borderTopRightRadius: entryBorderRadius,
    },
});

const mapStyles = StyleSheet.create({
    mapContainer: {
        alignItems: 'center',
        // margin: 5,
        marginBottom: 0
    },
    map: {
        width: '100%',
        height: Dimensions.get('window').height / 3,
    },
    textContainer : {
        alignItems: 'center',
        marginTop: 8
    },
    locationTextContainer: {
        alignItems: 'center'
    }, 
    changeLocationButton: {
        alignItems: 'center',
        backgroundColor: '#28b573',
        margin: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#28b573',
        width: '40%',
        height: 40,
        justifyContent: 'center'
    },
    changeLocationButtonText : {
        color: 'white'
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
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between', 
        margin: 8
    },
    manualTitle: { 
        textAlign: 'center',
        fontSize: 18,
        marginBottom: 4
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
    manualModalSwitchText: {
        color: 'dodgerblue'
    }, 
    storeText: { 
        padding: 5,
        marginLeft: 10 
    },
    storeTextSelected: { 
        padding: 15,
        backgroundColor: '#28b573'
    }
});