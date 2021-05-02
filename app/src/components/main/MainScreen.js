import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE  } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

import NetInfo from '@react-native-community/netinfo';
import { recommendCard } from './RecommendCard';
import { Footer } from '../util/Footer';
import { user } from '../../network/user';
import { useIsFocused } from '@react-navigation/native';
import { MainModals } from './MainModals';
import { CardCarousel } from './CardCarousel';
import BottomSheet from 'react-native-simple-bottom-sheet';
import { StatusBar } from 'expo-status-bar';

const googlePlaceSearchURL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=";
const googlePlaceSearchRadius = "&radius=100&key=";
const googlePlaceDetailsURL = "https://maps.googleapis.com/maps/api/place/details/json?place_id=";
const googlePlaceDetailsFields = "&fields=geometry,name,types,formatted_address,place_id&key=";

export function MainScreen({navigation}) {
    const [region, setRegion] = useState({
        latitude: 38.542530, 
        longitude: -121.749530,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421
    })
    const [isLoading, setLoading] = useState(true);
    const [storeArr, setStoreArr] = useState([]);
    const [curStore, setCurStore] = useState(null);
    const [curStoreKey, setCurStoreKey] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [recCards, setRecCards] = useState(null);
    const isFocused = useIsFocused();
    const [locationInfoHeight, setLocationInfoHeight] = useState(0);
    const [footerHeight, setFooterHeight] = useState(0);

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
    }

    // Called when changing store to reload recommended cards
    function reloadRecCard(value, key, storeType) {
        // console.log("hihi " + storeType);
        setRecCards(null);
        recommendCard.getRecCards(storeType, getRecCardFromDB);
        if (key !== curStoreKey) {
            setCurStore(value);
            setCurStoreKey(key);
        }
    }

    function switchStoresFromPOI(event) {
        let last5placeId = event.placeId.substr(event.placeId.length - 5);
        let found = storeArr.find(o => (o.placeId.substr(o.placeId.length - 5) === last5placeId
            && o.label.includes(event.name.slice(0, event.name.indexOf("\n")))));
        // console.log(found);
        // console.log(last5placeId);
        // console.log(event.placeId);
        // console.log(event.name.slice(0, event.name.indexOf("\n")));
        if (found === undefined) {
            fetch(googlePlaceDetailsURL + 
                event.placeId + 
                googlePlaceDetailsFields + process.env.REACT_NATIVE_PLACE_SEARCH_API_KEY)
            .then((response) => response.json())
            .then((json) => {getLocationFromAPI(json)})
            .catch((error) => console.log(error))
        } else {
            let index = storeArr.indexOf(found);
            reloadRecCard(storeArr[index].label, storeArr[index].key, storeArr[index].storeType);
        }
    }

    function addManualInput(manualInputObj) {
        setStoreArr(storeList => storeList.concat(manualInputObj));
        console.log(manualInputObj);
        reloadRecCard(manualInputObj.label, manualInputObj.key, manualInputObj.storeType);
    }

    function getLocationFromAPI(json) {
        let fetchResult = json.results !== undefined ? json.results : [json.result];
        let fetchStores = [];
        if (fetchResult == undefined || fetchResult.length == 0) {
            return;
        }
        let addCount = storeArr.length - 1 === -1 ? 0 : storeArr.length;
        let fetchResultLen = Object.keys(fetchResult).length;

        for (let i = 0; i < fetchResultLen; i++) {
            if (i === fetchResultLen) {
                break;
            }
            if (fetchResult[i].types.includes("locality")) {
                continue;
            } else if (storeArr.length === 0 || storeArr.find(o => o.placeId === JSON.stringify(fetchResult[i].place_id).slice(1,-1)) === undefined) {
                let storeType = JSON.stringify(fetchResult[i].types[0]).slice(1,-1).replace(/_/g, " ");
                storeType = storeType.charAt(0).toUpperCase() + storeType.slice(1);
                let address;
                if (json.results !== undefined) {
                    address = JSON.stringify(fetchResult[i].vicinity).slice(1,-1);
                } else {
                    address = JSON.stringify(fetchResult[i].formatted_address).slice(1,-1);
                    let commaIdx = address.indexOf(",");
                    commaIdx = address.indexOf(",", commaIdx + 1);
                    address = address.substr(0, commaIdx);
                }
                fetchStores.push({
                    label: JSON.stringify(fetchResult[i].name).slice(1,-1),
                    value: JSON.stringify(fetchResult[i].name).slice(1,-1),
                    vicinity: address,
                    placeId: JSON.stringify(fetchResult[i].place_id).slice(1,-1),
                    geometry: [parseFloat(JSON.stringify(fetchResult[i].geometry.location.lat)),
                        parseFloat(JSON.stringify(fetchResult[i].geometry.location.lng))],
                    storeType: storeType,
                    key: addCount,
                })
                addCount++;
            }
        }
        setStoreArr(prevStores => [...prevStores, ...fetchStores]);
        if (fetchStores.length > 0) {
            setCurStore(fetchStores[0].label);
            setCurStoreKey(fetchStores[0].key);
            recommendCard.getRecCards(fetchStores[0].storeType, getRecCardFromDB);
        }
    };

    function onBottomSheetLayout(event, isFooter) {
        let {width, height} = event.nativeEvent.layout;
        if (!isFooter) {
            if (locationInfoHeight !== 0) {
                return;
            }
            setLocationInfoHeight(height);
        } else {
            if (footerHeight !== 0) {
                return;
            }
            setFooterHeight(height);
        }
        console.log(isFooter + " " + height);
    }

    useEffect(() => {
        user.currentStore = storeArr[curStoreKey];
    });

    // Called to refresh recommended cards if new cards added
    useEffect(() => {
        if (isLoading === false) {
            const unsubscribe = navigation.addListener('focus', () => {
                if (user.getMainNeedsUpdate()) {
                    /* triggered on a reload of the page */
                    setRecCards(null);
                    console.log("reset rec cards");
                    reloadRecCard(curStore, curStoreKey, storeArr[curStoreKey].storeType);
                    user.setMainNeedsUpdate(false);
                }
            });
            return unsubscribe;
        }
    }, [isFocused]);

    // Called on mount
    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
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
                    }
                    });
            } catch(e) {
                setOfflineMode();
                setLoading(false);
                return;
            }
        })();
    }, []);
    
   

    return (
        <View style={styles.screen}>
            <StatusBar barStyle='dark-content'/>
            {/* Modal */}
            <MainModals
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
                reloadRecCard={reloadRecCard}
                addManualInput={addManualInput}
                storeArr={storeArr}
                curStore={curStore}
                region={region}
                curStoreKey={curStoreKey}
            />
            <View style={{zIndex: 1}}>                
                {/* Map Area */}
                <View style={mapStyles.mapContainer}>
                    {/* Butons */}
                    <View style={mapStyles.buttonArea}>
                        <View style={mapStyles.buttonContainer}>
                            <TouchableOpacity
                                style={{borderBottomWidth: 0.5}}
                                onPress={() => console.log("pressed for help")}
                            >
                                <Ionicons
                                    name="information-outline"
                                    color={'black'}
                                    size={30}
                                ></Ionicons>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setModalVisible(true)}
                            >
                                <Ionicons
                                    name="swap-vertical-outline"
                                    color={'black'}
                                    size={30}
                                ></Ionicons>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Map (Google) */}
                    <MapView 
                        style={mapStyles.map}
                        provider= {PROVIDER_GOOGLE}
                        region = {region}
                        showsUserLocation={true}
                        onPoiClick={e => switchStoresFromPOI(e.nativeEvent)}
                    >
                        <Marker coordinate={(curStoreKey !== null && storeArr.length > 0 ?
                            { latitude: storeArr[curStoreKey].geometry[0], longitude: storeArr[curStoreKey].geometry[1]} :
                            { latitude: region.latitude, longitude: region.longitude }
                        )} />
                    </MapView>
                </View>
                <View>
                    <BottomSheet isOpen={false}
                        sliderMinHeight={Platform.OS === 'ios' ? locationInfoHeight + footerHeight + 75 : locationInfoHeight + 75}
                        sliderMaxHeight={(Dimensions.get('window').height)}
                        wrapperStyle={Platform.OS === 'ios' ? {paddingBottom: footerHeight + 50} : {paddingBottom: footerHeight}}
                    >
                        {/* Location text */}
                        <View style={mapStyles.textContainer} onLayout={(LayoutEvent) => onBottomSheetLayout(LayoutEvent, false)}>
                            <View style={mapStyles.locationTextContainer}>
                                <Text>{isLoading ? "Loading" : curStore}</Text>
                                <Text>
                                    {isLoading ? "N/A" : storeArr[curStoreKey].vicinity}
                                </Text>
                                <Text>
                                    {"Category: " + (isLoading ? "" : storeArr[curStoreKey].storeType)}
                                </Text>
                            </View>
                        </View>

                        {/* Recommended Card */}
                        <CardCarousel
                            recCards={recCards}
                            navigation={navigation}
                            storeArr={storeArr}
                            curStoreKey={curStoreKey}
                        />
                    </BottomSheet>
                </View>
            </View>
            {/* Footer */}
            <View style={styles.footerContainer} onLayout={(LayoutEvent => onBottomSheetLayout(LayoutEvent, true))}>
                <Footer navigation={navigation} />
            </View>
        </View>
        );
    }
    

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: 'white',
        height: '100%',
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
    footerContainer: {
        width: '100%',
        backgroundColor: 'white',
        position: 'absolute', 
        bottom: 0, 
        paddingBottom: 35,
        zIndex: 10,
    }
});

const mapStyles = StyleSheet.create({
    buttonArea: {
        top: Constants.statusBarHeight,
        position: 'absolute',
        zIndex: 1,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    buttonContainer: {
        flexDirection: 'column',
        position: 'relative',
        borderRadius: 5,
        backgroundColor: 'white',
        padding: 5,
        margin: 10,
        borderWidth: 0.5,
    },
    mapContainer: {
        alignItems: 'center',
    },
    map: {
        width: '100%',
        height: Dimensions.get('window').height,
    },
    textContainer : {
        alignItems: 'center',
        paddingBottom: 10,
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
        justifyContent: 'center',
    },
    changeLocationButtonText : {
        color: 'white'
    }
});

