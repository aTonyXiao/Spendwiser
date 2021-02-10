import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Image, Dimensions, TouchableOpacity, ScrollView, SafeAreaView, Modal } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { TextInput } from 'react-native-gesture-handler';
import RNPickerSelect from 'react-native-picker-select';
import { Ionicons } from '@expo/vector-icons';

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
    const [manualInput, setManualInput] = useState({store_name: "", vicinity: "", store_type: ""});
      
    const handleManualInput = (val, inputStr) => setManualInput({...manualInput, [val]: inputStr});

    function getLocationFromAPI(json) {
        setPlaces(json.results);
        let fetch_result = json.results;
        let fetch_stores = [];

        if (fetch_result == undefined || fetch_result.length == 0) {
            return;
        }
        let add_count = 0;
        let fetch_result_len = Object.keys(fetch_result).length - 1;
        for (let i = 0; i < fetch_result_len; i++) {
            if (i === fetch_result_len) {
                break;
            }
            if (fetch_result[i].types.includes("locality")) {
                continue;
            } else {
                let storeType = JSON.stringify(fetch_result[i].types[0]).slice(1,-1).replace(/_/g, " ");
                fetch_stores.push({
                    label: JSON.stringify(fetch_result[i].name).slice(1,-1),
                    value: JSON.stringify(fetch_result[i].name).slice(1,-1),
                    vicinity: JSON.stringify(fetch_result[i].vicinity).slice(1,-1),
                    store_type: storeType.charAt(0).toUpperCase() + storeType.slice(1), 
                    key: add_count,
                })
                if (add_count == 0) {
                    setCurStore(JSON.stringify(fetch_result[i].name).slice(1,-1));
                    setCurStoreKey(0);
            }
            add_count++;
            }
        }
        setStoreArr(fetch_stores);
    };

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setRegion({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.0052,
                longitudeDelta: 0.0051,
            })
            fetch(googlePlaceSearchURL + 
                location.coords.latitude + "," + location.coords.longitude + 
                googlePlaceSearchRadius + process.env.REACT_NATIVE_PLACE_SEARCH_API_KEY)
            .then((response) => response.json())
            .then((json) => {getLocationFromAPI(json)})
            .catch((error) => console.log(error))
            .finally(() => setLoading(false));
        })();
    }, []);
    
    return (
        <SafeAreaView style={styles.screen}>
            <Modal
                    animationType="slide"
                    transparent={true}
                    backdropOpacity = {0.3}
                    visible={modalVisible}
                    onShow={() => setManualInput({store_name: "", vicinity: "", store_type: ""})}
                    onRequestClose={() => {
                    Alert.alert('Modal has been closed.');
                    }}>
                    <View style={styles.modalCenteredView}>
                        <View style={styles.modalView}>
                            <TextInput
                                style={styles.modalTextInput}
                                onChangeText={text => {
                                    setManualInput((prevState) => {
                                        return {...prevState, store_name: text};
                                    })
                                }}
                                value={manualInput.store_name}
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
                                        return {...prevState, store_type: text};
                                    })
                                }}
                                value={manualInput.store_type}
                                placeholder={"Category (Required)"}
                            />
                            <View style={{flexDirection: "row", marginTop: 10, justifyContent: 'space-between', padding: 10}}>
                                <Button
                                    onPress={() => {
                                        setModalVisible(!modalVisible);
                                        if (manualInput.store_type.length != 0) {
                                            let manualInputObj = {
                                                label: manualInput.store_name.length === 0 ? "Manual Input" : manualInput.store_name,
                                                value: manualInput.store_name.length === 0 ? "Manual Input" : manualInput.store_name,
                                                vicinity: manualInput.store_name.vicinity === 0 ? "N/A" : manualInput.vicinity,
                                                store_type: manualInput.store_type,
                                                key: Object.keys(storeArr).length - 1,
                                            }
                                            setStoreArr(storeList => storeList.concat(manualInputObj));
                                            setCurStore(manualInput.store_name.length === 0 ? "Manual Input" : manualInput.store_name);
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
                        onValueChange={(value, key) => {setCurStore(value), setCurStoreKey(key)}}
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
                        {"Category: " + (isLoading ? "" : storeArr[curStoreKey].store_type)}
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
                    <Image style={styles.card}
                        source={require('../../assets/sapphire_reserve_card.png')} />
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
                            // onPress={() => }
                        ></Button>
                    </View>
                </View>
                <View style= {{flex:2}}/>
                <Button
                    title="See your cards"
                    onPress={() => navigation.navigate('Cards')}
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