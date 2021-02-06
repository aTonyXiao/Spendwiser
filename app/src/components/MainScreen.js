import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Image, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { TextInput } from 'react-native-gesture-handler';

const googlePlaceSearchURL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location="
const googlePlaceSearchRadius = "&radius=100&key="

export function MainScreen() {
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
    const [locations, setLocations] = useState([]);
    const [chosenLoc, setChosenLoc] = useState(0);

    function getLocationFromAPI(json) {
        setPlaces(json.results);
        let fetch_result = json.results;
        let fetch_location = [];

        if (fetch_result == undefined || fetch_result.length == 0) {
            return;
        }
        let add_count = 0;
        for (let i = 0; add_count < 5; i++) {
            if (fetch_result[i].types.includes("locality")) {
                continue;
            } else {
                fetch_location.push({
                    name: JSON.stringify(fetch_result[i].name).slice(1,-1),
                    vicinity: JSON.stringify(fetch_result[i].vicinity).slice(1,-1),
                    store_type: JSON.stringify(fetch_result[i].types[0]).slice(1,-1), 
                })
                add_count++;
            }
        }
        setLocations(fetch_location);
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
    
    // console.log(text);

    return (
        <View style={styles.screen}>
            <View style={styles.map_container}>
                <MapView style={styles.map}
                    provider = "google"
                    region = {region}
                >
                <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }} />
                </MapView>
            </View>
            <View style={{position: 'absolute', right: 10}}>
                <Button
                    color="green"
                    title="Refresh"
                    // onPress={() => setRegion(location.latitude, location.longitude)}
                ></Button>
            </View>
            <View style={styles.loc_container}>
                <View style={styles.loc}>
                    <Text style={styles.loc_name}>
                        {isLoading ? "Loading" : locations[0].name}
                    </Text>
                    <Text>
                        {isLoading ? "" : locations[0].vicinity}
                    </Text>
                    <Text>{"Category: " + 
                        (isLoading ? "" : locations[0].store_type)}</Text>
                </View>
                <Button
                    title="Change"
                ></Button>
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
                    ></Button>
                </View>
            </View>
            <View style= {{flex:2}}>

            </View>
        </View>
        );
    }
    
    const styles = StyleSheet.create({
        screen: {
            flex: 1,
            padding: 10,
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
      loc_container: {
          marginTop: 20,
          flex: 1,
          flexDirection: 'row',
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
      }
    });