import React, { useReducer } from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { user } from '../../network/user';
import {appBackend} from '../../network/backend'

function AddCardModal({navigation, modalVisible, setModalVisible}) {
    function navigateIfAuthorized(navigation, location, errmsg) {
        appBackend.userAccountType((type) => {
            switch(type) {
            case 'offline':
                Alert.alert(
                    "Unable to use this feature",
                    errmsg,
                    [
                        { text: "OK", onPress: () => { setModalVisible(false) }}
                    ]
                );
                break;
            case 'normal':
                setModalVisible(false);
                navigation.navigate(location);
            }
        });
    }
    return (
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
                                navigateIfAuthorized(navigation, 'AddCardDB', "Sign up with an account to use this feature");
                            }}
                            style={modalStyles.modalText}
                        >
                            <Text>By Search</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => {
                                navigateIfAuthorized(navigation, 'AddCardCamera', "Sign up with an account to use this feature");
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

    )
}

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

export { AddCardModal };