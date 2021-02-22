import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Image, Dimensions, TouchableOpacity, ScrollView, SafeAreaView, Modal } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { TextInput } from 'react-native-gesture-handler';
import RNPickerSelect from 'react-native-picker-select';
import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import { recommendCard } from './cards/RecommendCard';
import { user } from '../network/user';

const googlePlaceSearchURL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location="
const googlePlaceSearchRadius = "&radius=100&key="

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
    const [recCard, setRecCard] = useState(null);
    var width = Dimensions.get('window').width;
    const userId = user.getUserId();
      
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
        console.log("Finally ");
        console.log(myRankedCards);
        setRecCard({recCardId: myRankedCards[0]["cardId"], recCardImg: myRankedCards[0]["cardImg"]});
    }

    function changeRecCard(value, key) {
        if (key !== curStoreKey) {
            let category = storeArr[key]["storeType"];
            console.log("change rec card -> store name: " + storeArr[key]["value"] + " store type: " + storeArr[key]["storeType"]);
            recommendCard.getRecCards(category, getRecCardFromDB);
            setCurStore(value);
            setCurStoreKey(key);
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
                        console.log(storeArr);
                    }
                  });
            } catch(e) {
                setOfflineMode();
                setLoading(false);
                console.log(storeArr);
                return;
            }
        })();
    }, []);
    
    return (
        <SafeAreaView style={styles.screen}>
            <Modal
                    animationType="slide"
                    transparent={true}
                    backdropOpacity = {0.3}
                    visible={modalVisible}
                    onShow={() => setManualInput({storeName: "", vicinity: "", storeType: ""})}
                    onRequestClose={() => {
                    Alert.alert('Modal has been closed.');
                    }}>
                    <View style={styles.modalCenteredView}>
                        <View style={styles.modalView}>
                            <TextInput
                                style={styles.modalTextInput}
                                onChangeText={text => {
                                    setManualInput((prevState) => {
                                        return {...prevState, storeName: text};
                                    })
                                }}
                                value={manualInput.storeName}
                                placeholder={"Store Name (Optional)"}
                            />
                            <TextInput
                                style={styles.modalTextInput}
                                onChangeText={text => {
                                    setManualInput((prevState) => {
                                        return {...prevState, vicinity: text};
                                    })
                                }}
                                value={manualInput.vicinity}
                                placeholder={"Address (Optional)"}
                            />
                            <TextInput
                                style={styles.modalTextInput}
                                onChangeText={text => {
                                    setManualInput((prevState) => {
                                        return {...prevState, storeType: text};
                                    })
                                }}
                                value={manualInput.storeType}
                                placeholder={"Category (Required)"}
                            />
                            <View style={{flexDirection: "row", marginTop: 10, justifyContent: 'space-between', padding: 10}}>
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
                                    title="Set"> </Button>
                                <View style={{width:20}} />
                                <Button
                                    onPress={() => {
                                        setModalVisible(!modalVisible);
                                    }}
                                    title="Close"> </Button>
                            </View>
                            
                        </View>
                    </View>
                </Modal>

            <ScrollView>
                <View style={styles.map_container}>
                    <MapView style={styles.map}
                        provider = "google"
                        region = {region}
                    >
                    <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }} />
                    </MapView>
                </View>
                <View style={{position: 'absolute', right: 0}}>
                    <Button
                        color="green"
                        title="Refresh"
                        // onPress={() => setRegion(location.latitude, location.longitude)}
                    ></Button>
                </View>
                <View style={styles.loc}>
                    <RNPickerSelect
                        placeholder={{}}
                        items={storeArr}
                        onValueChange={(value, key) => {setRecCard(null), changeRecCard(value, key)}}
                        pickerProps={{mode:'dropdown', itemStyle:{height: 100}}}
                        style={{...pickerSelectStyles,
                            iconContainer: {
                                top: 10,
                                right: 12,
                            },
                    }}
                        value={curStore}
                        useNativeAndroidPickerStyle={false}
                        Icon={() => {
                            return <Ionicons name="md-arrow-down" size={24} color="gray" />;
                        }}
                    />
                    <Text>
                        {"Address: " + (isLoading ? "" : storeArr[curStoreKey].vicinity)}
                    </Text>
                    <Text>
                        {"Category: " + (isLoading ? "" : storeArr[curStoreKey].storeType)}
                    </Text>
                    <TouchableOpacity
                        onPress={() => {setModalVisible(true)}}
                    >
                        <Text style={{color: 'blue'}}>Store not in list</Text>
                    </TouchableOpacity>
                </View>
                <View style= {{flex:1}}/>
                <View style={styles.card_container}>
                    <Text style={{fontWeight: 'bold', fontSize: 24}}>Recommended Card</Text>
                    <Image source = {recCard !== null ? {uri:recCard["recCardImg"]} : require("../../assets/load.jpg")}
                        style = {{ 
                            width: width * .8,  //its same to '20%' of device width
                            aspectRatio: 1.5, // <-- this
                            resizeMode: 'contain', //optional
                        }}
                    />
                <View style={styles.card_spending}>
                        <TextInput
                            style={styles.amount_field}
                            onChangeText={text => setAmountSpent(text)}
                            value={amountSpent}
                            placeholder={"Amount Spent"}
                            keyboardType='numeric'
                        />
                        <Button
                            title="Update"
                            onPress={() => recommendCard.setTransaction(storeArr[curStoreKey], recCard, amountSpent)}
                        ></Button>
                    </View>
                </View>
                <View style= {{flex:2}}/>
                <Button
                    title="See your cards"
                    onPress={() => navigation.navigate('YourCards')}
                ></Button>
                <Button
                    title="Settings"
                    onPress={() => navigation.navigate('Settings')}
                ></Button>
            </ScrollView>
        </SafeAreaView>
        );
    }
    
    const styles = StyleSheet.create({
        screen: {
            flex: 1,
        },
      map_container: {
        flex: 3,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
      },
      map: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height / 4,
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
      card_container: {
          flex: 5,
          alignItems: 'center'
      },
      card_spending: {
          padding: 10,
          flexDirection: 'row',
          justifyContent: 'space-between'
      },
      amount_field: {
          height: 40,
          borderColor: 'gray',
          borderWidth: 1,
          flex: 1
      },
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
        padding: 22,
        justifyContent: 'center',
        alignItems: 'stretch',
        borderRadius: 4,
        borderColor: 'rgba(0, 0, 0, 0.1)',
      },
      modalTextInput: {
        height: 40,
        marginTop: 10,
        borderColor: 'gray',
        borderWidth: 1,
      }
    });

    const pickerSelectStyles = StyleSheet.create({
        inputIOS: {
          fontSize: 20,
          fontWeight: 'bold',
          paddingVertical: 12,
          paddingHorizontal: 10,
          borderWidth: 1,
          borderColor: 'gray',
          borderRadius: 4,
          color: 'black',
          paddingRight: 30, // to ensure the text is never behind the icon
        },
        inputAndroid: {
          fontSize: 20,
          fontWeight: 'bold',
          paddingHorizontal: 10,
          paddingVertical: 8,
          borderWidth: 0.5,
          borderColor: 'black',
          borderRadius: 8,
          color: 'black',
          paddingRight: 30, // to ensure the text is never behind the icon
        },
      });