import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Image, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { TextInput } from 'react-native-gesture-handler';

const googlePlaceSearchURL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location="
const googlePlaceSearchRadius = "&radius=100&key=AIzaSyBjvCHsXdtG924_6DpetOLJPliM--FKWWQ"

export function MainScreen() {
    const [curLoc, setCurLoc] = useState("UC Davis Memorial Union");
    const [curAddress, setCurAddress] = useState("250 W Quad, Davis, CA 95616");
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
                googlePlaceSearchRadius)
            .then((response) => response.json())
            .then((json) => setPlaces(json.results))
            .catch((error) => console.log(error))
            .finally(() => setLoading(false));
        })();
        }, []);

    // let text = 'Waiting..';
    // if (errorMsg) {
    //     text = errorMsg;
    // } else if (location) {
    //     text = JSON.stringify(location);
    // }
    
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
                        {isLoading ? "Loading" : JSON.stringify(places[1].name).slice(1,-1)}
                    </Text>
                    <Text>
                        {isLoading ? "" : JSON.stringify(places[1].vicinity).slice(1,-1)}
                    </Text>
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