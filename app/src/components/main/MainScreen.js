import React, { useState, useEffect, useRef } from 'react';
import ReactNative, { View, Text, StyleSheet, Dimensions, Platform, BackHandler, SafeAreaView } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE  } from 'react-native-maps';
import * as Location from 'expo-location';

import NetInfo from '@react-native-community/netinfo';
import { recommendCard } from './RecommendCard';
import { Footer } from '../util/Footer';
import { user } from '../../network/user';
import { useIsFocused } from '@react-navigation/native';
import { MainModals } from './MainModals';
import { CardCarousel } from './CardCarousel';
import BottomSheet from 'react-native-simple-bottom-sheet';
import { StatusBar } from 'expo-status-bar';
import { MainButtons } from './MainButtons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import mainStyles from '../../styles/mainStyles';
import * as storage from '../../local/storage';

const googlePlaceSearchURL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=";
const googlePlaceSearchRadius = "&radius=100&key=";
const googlePlaceDetailsURL = "https://maps.googleapis.com/maps/api/place/details/json?place_id=";
const googlePlaceDetailsFields = "&fields=geometry,name,types,formatted_address,place_id&key=";

/**
 * Display main screen with Google maps, nearby stores, and recommended cards based on selected stores
 * 
 * @param {Object} obj - Object passed to Main Screen
 * @param {Object} obj.navigation - navigation object used to move between different pages
 * @module MainScreen
 */
export function MainScreen({navigation}) {
    const [region, setRegion] = useState({
        latitude: 38.542530, 
        longitude: -121.749530,
        latitudeDelta: 0.0052,
        longitudeDelta: 0.0051,
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
    const [userLocation, setUserLocation] = useState(null);
    const [internetState, setInternetState] = useState(false);
    const internetRef = useRef(false);

    /**
     * Set main screen to display no internet connection
     * Use case: No internet connection, have location permissions
     * @param {Array} coords - Coordinate array with user's location to set the current region to.
     * @function setOfflineMode
     */
    function setOfflineMode(coords) {
        // Only set storearr to show no internet connection when loading for the first time
        if (storeArr.length === 0) {
            setStoreArr([{
                label: "No Internet Connection",
                value: "No Internet Connection",
                vicinity: "Click help button for more info",
                placeId: "",
                geometry: [coords.latitude, coords.longitude],
                storeType: "N/A", 
                key: 0,
            }])
            setCurStore("No Internet Connection");
            setCurStoreKey(0);
            setRegion({...region, longitude: coords.longitude, latitude: coords.latitude});
            setRecCards(null);
            setLoading(false);
        }
    }

    /**
     * Set main screen to display no location permission
     * Use case: No location, with or without internet
     * @function setLocationDisabledMode
     */
    function setLocationDisabledMode() {
        setStoreArr([{
            label: "Location Permission Denied",
            value: "Location Permission Denied",
            vicinity: "Click help button for more info",
            placeId: "",
            geometry: [38.542530, -121.749530,],
            storeType: "N/A", 
            key: 0,
        }])
        setCurStore("Location Permission Denied");
        setCurStoreKey(0);
        setUserLocation({ latitude: 38.542530, longitude: -121.749530});
        setLoading(false);
    }

    /**
     * Prevent android users from using hardware back button on main screen
     * @returns {boolean} - Returns true on Main Screen and false on other pages
     * @function backAction
     */
    const backAction = () => {
        if (navigation.isFocused())
            return true;
        else
            return false;
    }

    /**
    * Calls storage function to check if card is disabled
    * @returns {array} - Is the card disabled or not
    * @function getDisabledCards
    */
     async function getDisabledCards() {
        return new Promise((resolve, reject) => {
            storage.getDisabledCards((val) => {
                let cardIdList = val['cards'];
                resolve(cardIdList);
            });
        })
    }

    /**
     * Sets the ranked cards and checks for disabled cards
     * @param {array} myRankedCards - the array of ranked cards objects
     * @callback getRecCardFromDB
     */
    function getRecCardFromDB(myRankedCards) {
        // check for disabled cards
        getDisabledCards().then((data) => {
            let disabledCards = data;
            let rankedEnabledCards = [];
            for (let i=0 ; i< myRankedCards.length ; i++) {
                if (!(disabledCards.includes(myRankedCards[i].cardId))) {
                    rankedEnabledCards.push(myRankedCards[i]);
                }
            }
            setRecCards(rankedEnabledCards);
        })
    }

    /**
     * Called when recommended cards need changing
     * Should be called when user disable/enable cards, add cards, delete cards, change selected store
     * @param {string} value - new selected store
     * @param {int} key - index of new selected store in storeArr
     * @param {string} storeType - category of new selected store
     * @param {Array} geometry - Array with longitude and latitude of new selected store
     * @function reloadRecCard
     */
    function reloadRecCard(value, key, storeType, geometry) {
        recommendCard.getRecCards(storeType, getRecCardFromDB);
        if (key !== curStoreKey || curStore !== value) {
            setCurStore(value);
            setCurStoreKey(key);
            setRegion({...region, longitude: geometry[1], latitude: geometry[0]});
        }
    }

    /**
     * Function to switch selected store to user's selected store on Google Maps, then reload recommended cards
     * If new selected store not in storeArr, add the new store to the array.
     * @param {Object} event - POI object given by Google Maps on POI click
     * @function switchStoresFromPOI
     */
    function switchStoresFromPOI(event) {
        let last5placeId = event.placeId.substr(event.placeId.length - 5);
        let found = storeArr.find(o => (o.placeId.substr(o.placeId.length - 5) === last5placeId
            && o.label.includes(event.name.slice(0, event.name.indexOf("\n")))));
        if (found === undefined) {
            NetInfo.fetch().then(state => {
                // If connected to internet, query API for nearby stores. Else: set offline mode
                if (state.isConnected) {
                    fetch(googlePlaceDetailsURL + 
                        event.placeId + 
                        googlePlaceDetailsFields + process.env.REACT_NATIVE_PLACE_SEARCH_API_KEY)
                    .then((response) => response.json())
                    .then((json) => {getLocationFromAPI(json)})
                    .catch((error) => console.log(error))
                }
            });
        } else {
            let index = storeArr.indexOf(found);
            reloadRecCard(storeArr[index].label, storeArr[index].key, storeArr[index].storeType, storeArr[index].geometry);
        }
    }

    /**
     * Add the manual store to the storeArr, set it as the selected store and reload the recommended cards
     * @param {Object} manualInputObj - object containing user's manual store to add to storeArr
     * @function addManualInput
     */
    function addManualInput(manualInputObj) {
        if (storeArr[0].value === 'Location Permission Denied' || storeArr[0].value === 'No Internet Connection') {
            if (manualInputObj.value === 'Manual Input 1') {
                manualInputObj.value = 'Manual Input 0';
                manualInputObj.label = 'Manual Input 0';
            }
            manualInputObj.key = 0;
            setStoreArr([manualInputObj]);
        }
        else
            setStoreArr(storeList => storeList.concat(manualInputObj));
        reloadRecCard(manualInputObj.label, manualInputObj.key, manualInputObj.storeType, manualInputObj.geometry);
    }

    /**
     * Load the store array with stores found 100m around the user's location
     * @param {JSON} json - JSON document with a list of stores
     * @function getLocationFromAPI
     */
    function getLocationFromAPI(json) {
        let fetchResult = json.results !== undefined ? json.results : [json.result];
        let fetchStores = [];
        if (fetchResult == undefined || fetchResult.length == 0) {
            return;
        }
        let addCount = storeArr.length - 1 === -1 ? 0 : storeArr.length;
        if (storeArr.length !== 0 && (storeArr[0].value === 'Location Permission Denied' || storeArr[0].value === 'No Internet Connection'))
            addCount = 0;
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
        // Remove location permission denied info if clicking POI manually
        if (storeArr.length !== 0 && (storeArr[0].value === 'Location Permission Denied' || storeArr[0].value === 'No Internet Connection')) {
            setStoreArr(fetchStores);
        }
        else
            setStoreArr(prevStores => [...prevStores, ...fetchStores]);
        if (fetchStores.length > 0) {
            setCurStore(fetchStores[0].label);
            setCurStoreKey(fetchStores[0].key);
            setRegion({...region, longitude: fetchStores[0].geometry[1], latitude: fetchStores[0].geometry[0]});
            recommendCard.getRecCards(fetchStores[0].storeType, getRecCardFromDB);
        }
    };

    /**
     * Check if app has location permission. If no permission, call setLocationDisabledMode()
     * Check if app has internet connection. If no internet, call setOfflineMode()
     * If have internet and location, fetch Google Places API and load stores into store array with getLocationFromAPI()
     * @async
     * @function tryToGetStoresFromLocation
     */
    async function tryToGetStoresFromLocation() {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            setLocationDisabledMode();
        } else {
            try {
                let location = await Location.getCurrentPositionAsync({accuracy: Location.Accuracy.Balanced});
                setUserLocation(location.coords);
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
                        // Use case: Have location and no internet
                        setOfflineMode(location.coords);
                    }
                    });
            } catch(e) {
                setLocationDisabledMode();
                console.log("Error in getting location or stores");
            }
        } 
    }

    /**
     * Sets the minimum height of the bottom sheet by getting the height of the footer and the bottom sheet store text
     * @param {Object} event - object containing the height of the component the call came from
     * @param {int} insets - additional border height
     * @param {boolean} isFooter - if the function call came from the footer component
     * @function onBottomSheetLayout
     */
    function onBottomSheetLayout(event, insets, isFooter) {
        let {width, height} = event.nativeEvent.layout;
        if (!isFooter) {
            if (locationInfoHeight !== 0) {
                return;
            }
            setLocationInfoHeight(height + insets);
        } else {
            if (footerHeight !== 0) {
                return;
            }
            setFooterHeight(height + insets);
        }
    }

    /**
     * useEffect to be called when main screen in focus. Checks if recommended cards require update
     */
    useEffect(() => {
        user.currentStore = storeArr[curStoreKey];
        if (isLoading === false) {
            const unsubscribe = navigation.addListener('focus', () => {
                if (user.getMainNeedsUpdate()) {
                    /* triggered on a reload of the page */
                    reloadRecCard(curStore, curStoreKey, storeArr[curStoreKey].storeType, storeArr[curStoreKey].geometry);
                    user.setMainNeedsUpdate(false);
                }
            });
            return unsubscribe;
        }
    }, [isFocused]);

    /**
     * useEffect called on mount. Add android backpress and internet state event listener
     * call tryToGetStoresFromLocation() to setup main screen
     */
    useEffect(() => {
        BackHandler.addEventListener('hardwareBackPress', backAction);
        const unsubscribe = NetInfo.addEventListener(state => {
            if (internetRef.current === false && state.isConnected === true) {
                if (storeArr.length > 0 && storeArr[0].value === 'No Internet Connection') {
                    tryToGetStoresFromLocation();
                }
                internetRef.current = true;
                setInternetState(true);
            } else if (internetRef.current === true && state.isConnected === false) {
                internetRef.current = false;
                setInternetState(false);
            }
        });
        (async () => {
            tryToGetStoresFromLocation();
        })();
        return () => {
            BackHandler.removeEventListener('hardwareBackPress', backAction);
            unsubscribe();
        }
    }, []);
    
    const insets = useSafeAreaInsets();

    return (
        <View style={styles.screen} edges={["right", "bottom", "left"]}>
            <StatusBar barStyle='dark-content'/>
            {/* Modal */}
            <MainModals
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
                reloadRecCard={reloadRecCard}
                addManualInput={addManualInput}
                storeArr={storeArr}
                curStore={curStore}
                userLocation={userLocation}
            />
            <View style={mainStyles.bodyContainer}>                
                {/* Map Area */}
                <View style={mapStyles.mapContainer}>
                    {/* Butons */}
                    <MainButtons
                        navigation={navigation}
                        setUserLocation={setUserLocation}
                        region={region}
                        setRegion={setRegion}
                        setModalVisible={setModalVisible}
                        internetState={internetState}
                        tryToGetStoresFromLocation= {tryToGetStoresFromLocation}
                    />

                    {/* Map (Google) */}
                    <MapView 
                        style={mapStyles.map}
                        provider= {PROVIDER_GOOGLE}
                        region = {region}
                        onRegionChangeComplete = {(e)=> {
                            if (Math.abs(e.longitudeDelta - region.longitudeDelta) > 0.001)
                                setRegion(e);
                            }}
                        showsUserLocation={true}
                        onPoiClick={e => {if (internetState) switchStoresFromPOI(e.nativeEvent)}}
                        showsMyLocationButton={false}
                    >
                        {(storeArr.length > 0 &&
                            storeArr[0].value !== "No Internet Connection" && storeArr[0].value !== "Location Permission Denied") &&
                            <Marker coordinate={(curStoreKey !== null && storeArr.length > 0 ?
                                { latitude: storeArr[curStoreKey].geometry[0], longitude: storeArr[curStoreKey].geometry[1]} :
                                { latitude: region.latitude, longitude: region.longitude }
                            )} />
                        }
                    </MapView>
                </View>
                <View style={Platform.OS !== 'ios' ? {flex: 1} : {}}>
                    <BottomSheet isOpen={false}
                        sliderMinHeight={Platform.OS === 'ios' ? locationInfoHeight + footerHeight + 75 : locationInfoHeight + footerHeight + 55}
                        sliderMaxHeight={(Dimensions.get('window').height)}
                        wrapperStyle={Platform.OS === 'ios' ? {paddingBottom: footerHeight + 25} : {paddingBottom: footerHeight + 25}}
                    >
                        {/* Location text */}
                        <View style={mapStyles.textContainer} onLayout={(LayoutEvent) => onBottomSheetLayout(LayoutEvent, 0, false)}>
                            <View style={mapStyles.locationTextContainer}>
                                <Text
                                    style={{fontWeight: '500', fontSize: 20, textAlign: 'center', marginBottom: 10}}
                                    numberOfLines={1}
                                >{isLoading ? "Loading" : curStore}</Text>
                                <Text>
                                    {isLoading || !(curStoreKey in storeArr) ? "N/A" : storeArr[curStoreKey].vicinity}
                                </Text>
                                <Text>
                                    {(isLoading || curStore === 'Location Permission Denied' || curStore === 'No Internet Connection')
                                        ? " " : "Category: " + storeArr[curStoreKey].storeType}
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
            <View style={mainStyles.footerContainer} onLayout={(LayoutEvent => onBottomSheetLayout(LayoutEvent, insets.bottom, true))}>
                <Footer navigation={navigation} />
            </View>
            <View style={{alignSelf: "flex-end", width: "100%", height: insets.bottom, backgroundColor: "white"}} />
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
        alignItems: 'center',
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
