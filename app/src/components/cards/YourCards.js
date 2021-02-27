import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Button, View, Text, Modal, TouchableOpacity } from 'react-native';
import mainStyles from '../../styles/mainStyles';
import { Card } from './Card';
import { user } from '../../network/user';
import { useState, useEffect } from "react";
import { Ionicons } from '@expo/vector-icons';
import { Footer } from '../main/Footer';

export function YourCards({navigation}) { 
    const [cards, setCards] = useState([]);
    const userId = user.getUserId();
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadCards(userId);
        });
        return unsubscribe;
    }, [navigation]);


    function loadCards(userId) {
        user.getCards(userId).then((cards) => {
            setCards(cards);
        })
    };

    if (cards.length == 0) { 
        return (
            <View>
                <Text>You currently have no stored cards!</Text>
                <Button title="Add Card" onPress={() => navigation.navigate('AddCard')}></Button>
            </View>
        )
    }

    return (
        <SafeAreaView style={mainStyles.container}>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    Alert.alert("Modal has been closed.");
                    setModalVisible(!modalVisible);
                }}
            >
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>Add New Card</Text>
                    <TouchableOpacity
                        onPress={() => {
                            setModalVisible(!modalVisible);
                            navigation.navigate('AddCardDB');
                        }}
                    >
                        <Text style={styles.modalText}>By Search</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => { 
                            setModalVisible(!modalVisible);
                            navigation.navigate('AddCardCamera');
                        }}
                    >
                        <Text style={styles.modalText}>By Camera</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => {
                            setModalVisible(!modalVisible);
                            navigation.navigate('AddCardManual');
                        }}
                    >
                        <Text style={styles.modalText}>Manually</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setModalVisible(!modalVisible)}>
                        <Text style={styles.modalText}>TEMPORARY: Hide Modal</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
            <View style={styles.addButton}>
                <TouchableOpacity onPress={() => setModalVisible(true)}>
                    <Ionicons
                        name="add-circle-outline"
                        color="white"
                        size={32}
                    ></Ionicons>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView}>
                <View>
                    {cards.map((card, i) => {
                        var props = {
                            navigation: navigation,
                            card: card
                        }
                        console.log("Creating card...");
                        return <Card key={i} props={props} />
                    })}
                </View>
            </ScrollView>

            <Footer navigation={navigation} />
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    container : {
        flex: 1,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center'
    },
    scrollView: {
        width: "95%"
    },
    modalView: {
        margin: 20,
        backgroundColor: "#28b573",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    addButton: {
        borderRadius: 100,
        padding: 5,
        backgroundColor: "#28b573",
        alignSelf: 'flex-end',
        margin: 8
    },
    modalText: {
        color: "white",
        textAlign: "center",
        margin: 5
    },
    modalTitle: { 
        fontSize: 24, 
        color: 'white',
        margin: 10
    }
});