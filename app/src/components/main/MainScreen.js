import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

import NetInfo from '@react-native-community/netinfo';
import { recommendCard } from './RecommendCard';
import { Footer } from '../util/Footer';
import { user } from '../../network/user';
import { useIsFocused } from '@react-navigation/native';
import { MainModals } from './MainModals';
import { CardCarousel } from './CardCarousel';

const googlePlaceSearchURL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location="
const googlePlaceSearchRadius = "&radius=100&key="

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

    function addManualInput(manualInputObj) {
        setStoreArr(storeList => storeList.concat(manualInputObj));
        console.log(manualInputObj);
        console.log("hi");
        reloadRecCard(manualInputObj.label, manualInputObj.key, manualInputObj.storeType);
    }

    function getLocationFromAPI(json) {
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
                    setCurStore(JSON.stringify(fetchResult[i].name).slice(1,-1));
                    setCurStoreKey(0);
                    recommendCard.getRecCards(storeType, getRecCardFromDB);
                }
                addCount++;
            }
        }
        setStoreArr(fetchStores);
    };

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
            let { status } = await Location.requestPermissionsAsync();
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
        <SafeAreaView style={styles.screen}>
            {/* Modal */}
            <MainModals
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
                reloadRecCard={reloadRecCard}
                addManualInput={addManualInput}
                storeArr={storeArr}
                curStore={curStore}
            />

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
                    <Text>{isLoading ? "Loading" : curStore}</Text>
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
            <CardCarousel
                recCards={recCards}
                navigation={navigation}
                storeArr={storeArr}
                curStoreKey={curStoreKey}
            />

            {/* Footer */}
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
        // Nathan's local changes for iPhone SE:
        // marginBottom: 15,
        // marginTop: 10 
    }
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

