import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View, Text, Modal, TouchableOpacity } from 'react-native';
import { Card } from './Card';
import { user } from '../../network/user';
import { useState, useEffect } from "react";
import { Ionicons } from '@expo/vector-icons';
import { Footer } from '../util/Footer';

export function YourCards({route, navigation}) { 
    const [cards, setCards] = useState([]);
    const userId = user.getUserId();
    const [modalVisible, setModalVisible] = useState(false);
    const storeInformation = route.params.storeInformation;

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            /* triggered on a reload of the page */
            loadCards(userId);
        });
        return unsubscribe;
    }, [navigation]);

    loadCards = () => {
        /* Make sure we aren't displaying any previous card lists */
        setCards([]);

        user.getCards(userId).then((cards) => {
            setCards(cards);
        })
    };

    // TODO: make this modal a component
    if (cards.length == 0) {
        return (
            <View style={{ marginTop: 10 }}>
                <View style={styles.bodyContainer}>
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={modalVisible}
                        onRequestClose={() => {
                            Alert.alert("Modal has been closed.");
                            setModalVisible(!modalVisible);
                        }}
                    >
                        <View style={modalStyles.modalCenteredView}>
                            <View style={modalStyles.modalView}>
                                <View style={modalStyles.modalHeader}>
                                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                                        <Ionicons
                                            name="close-circle-outline"
                                            color="black"
                                            size={26}
                                        ></Ionicons>
                                    </TouchableOpacity>
                                </View>

                                <View style={modalStyles.modalBody}>
                                    <Text style={modalStyles.modalTitle}>Add New Card</Text>
                                    <TouchableOpacity
                                        onPress={() => {
                                            setModalVisible(!modalVisible);
                                            navigation.navigate('AddCardDB');
                                        }}
                                        style={modalStyles.modalText}
                                    >
                                        <Text>By Search</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => {
                                            setModalVisible(!modalVisible);
                                            navigation.navigate('AddCardCamera');
                                        }}
                                        style={modalStyles.modalText}
                                    >
                                        <Text>By Camera</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => {
                                            setModalVisible(!modalVisible);
                                            navigation.navigate('AddCardManual');
                                        }}
                                        style={modalStyles.modalTextBottom}
                                    >
                                        <Text>Manually</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>


                    <View style={styles.addButton}>
                        <TouchableOpacity onPress={() => setModalVisible(true)}>
                            <Ionicons
                                name="add-circle-outline"
                                color="black"
                                size={32}
                            ></Ionicons>
                        </TouchableOpacity>
                    </View>

                    <Text style={{ marginTop: 40, fontSize: 18 }}>You currently have no stored cards!</Text>
                </View>
            </View>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.bodyContainer}>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => {
                        Alert.alert("Modal has been closed.");
                        setModalVisible(!modalVisible);
                    }}
                >
                    <View style={modalStyles.modalCenteredView}>
                        <View style={modalStyles.modalView}>
                            <View style={modalStyles.modalHeader}>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <Ionicons
                                        name="close-circle-outline"
                                        color="black"
                                        size={26}
                                    ></Ionicons>
                                </TouchableOpacity>
                            </View>

                            <View style={modalStyles.modalBody}>
                                <Text style={modalStyles.modalTitle}>Add New Card</Text>
                                <TouchableOpacity
                                    onPress={() => {
                                        setModalVisible(!modalVisible);
                                        navigation.navigate('AddCardDB');
                                    }}
                                    style={modalStyles.modalText}
                                >
                                    <Text>By Search</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => {
                                        setModalVisible(!modalVisible);
                                        navigation.navigate('AddCardCamera');
                                    }}
                                    style={modalStyles.modalText}
                                >
                                    <Text>By Camera</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => {
                                        setModalVisible(!modalVisible);
                                        navigation.navigate('AddCardManual');
                                    }}
                                    style={modalStyles.modalTextBottom}
                                >
                                    <Text>Manually</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
                <View style={styles.addButton}>
                    <TouchableOpacity onPress={() => setModalVisible(true)}>
                        <Ionicons
                            name="add-circle-outline"
                            color="black"
                            size={32}
                        ></Ionicons>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.scrollView}>
                    <View>
                        {cards.map((card, i) => {
                            var props = {
                                navigation: navigation,
                                card: card,
                                storeInformation: storeInformation
                            }
                            return <Card key={i.toString()} props={props} />
                        })}
                    </View>

                    {/* Below is empty height at bottom of scrollview becuase absolute footer cuts it off */}
                    <View style={{height:100}}></View>
                </ScrollView>
            </View>

            <View style={styles.footerContainer}>
                <Footer navigation={navigation} />
            </View>
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    container : {
        flex: 1,
        backgroundColor: 'white',
        height: '100%',
        display: 'flex',
        justifyContent: 'space-between', 
    },
    bodyContainer: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    scrollView: {
        width: "95%"
    },
    addButton: {
        borderRadius: 100,
        padding: 5,
        alignSelf: 'flex-end',
        margin: 8,
        marginBottom: 0
    },
    footerContainer: { 
        width: '100%',
        backgroundColor: 'white',
        position: 'absolute', 
        bottom: 0, 
        paddingBottom: 15,
        marginTop: 0
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
        margin: 8
    },
    modalBody: { 
        alignItems: 'center'
    },
    modalText: {
        color: 'black',
        margin: 5,
        backgroundColor: '#28b573',
        padding: 5,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#28b573'
    },
    modalTextBottom: {
        color: 'black',
        margin: 5,
        marginBottom: 15,
        backgroundColor: '#28b573',
        padding: 5,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#28b573'
    },
    modalTitle: { 
        fontSize: 24, 
        color: 'black',
        margin: 10, 
        marginTop: -26
    },
});