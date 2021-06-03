import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Dimensions, Alert } from 'react-native';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';
import { user } from '../../network/user';
import { DismissKeyboard } from '../util/DismissKeyboard';

/**
 * A modal for adding a transaction at current location
 * 
 * @param {{Object, boolean, Function, Function, String}} obj - The parameters object
 * @param {Object} obj.storeInformation - store information of transaction to add at
 * @param {boolean} obj.showTransactionModal - boolean value to show or hide transaction
 * modal 
 * @param {Function} obj.setShowTransactionModal - React function to set 
 * showTransactionModal
 * @param {Function} obj.setHasConstructed - React function to set rerender of parent 
 * function
 * @param {String} obj.cardId - id of current card
 * @module TransactionModal
 */
function TransactionModal({
        storeInformation, 
        showTransactionModal, 
        setShowTransactionModal, 
        setHasConstructed,
        cardId,
    }) {
    const deviceHeight =
    Platform.OS === 'ios'
    ? Dimensions.get('window').height
    : Dimensions.get('screen').height;
    const [transactionInput, setTransactionInput] = useState("");
    const userId = user.getUserId();
    const [displayErrorText, setDisplayErrorText] = React.useState(false);

    // Check if text input is a valid number and have a max of 2 decimals
    updateTextInput = (text) => {
        let dotIdx = text.indexOf(".");
        if (dotIdx === 0 || text.split('.').length > 2) {
            return;
        }
        if (text.length === 0 || dotIdx === -1 || (dotIdx === text.length - 1) || (text.length - dotIdx - 1 <= 2)) {
            return setTransactionInput(text);
        }
    }

    isInputValid = (input) => { 
        // don't allow $0 transactions
        if (isNaN(parseFloat(input))) { 
            return false;
        }

        if (parseFloat(input) == 0) { 
            toggleErrorText();
            return false;
        }

        return !isNaN(input); 
    }

    toggleErrorText = () => {
        setDisplayErrorText(true);

        setTimeout(function () {
            setDisplayErrorText(false);
        }, 2500)
    }

    addTransaction = () => {
        const inputIsValid = isInputValid(transactionInput);
        if (inputIsValid) { 
            if (!storeInformation) {
                Alert.alert("Store location not found!",
                            "Please wait until we can find your location before you add a transaction",
                            [
                                {text: "Ok"}
                            ],
                            { cancelable: false });
            } else {
                let transactionFiltered = parseFloat(transactionInput).toFixed(2).toString();
                user.saveTransaction(
                    userId, 
                    cardId, 
                    {
                        storeName: storeInformation["label"],
                        address: storeInformation["vicinity"],
                        storeType: storeInformation["storeType"]
                    },
                    transactionFiltered, 
                    (docId) => { 
                        user.addTransactionId(userId, docId);
                        setHasConstructed(false);
                    }
                );
            }
            setShowTransactionModal(false);
        } else {
            toggleErrorText();
        }
    }

    return (
        <DismissKeyboard>
            <Modal
                backdropOpacity={0.3}
                isVisible={showTransactionModal}
                statusBarTranslucent={true}
                deviceHeight={deviceHeight}
                style={{
                    margin: 0,
                    marginHorizontal: 0,
                    justifyContent: 'center',
                }}
                avoidKeyboard={true}
                onBackdropPress={() => { setTransactionInput(""), setShowTransactionModal(false) }}
            >
                <View style={modalStyles.modalCenteredView}>
                    <View style={modalStyles.modalView}>
                        <View style={modalStyles.modalHeader}>
                            <TouchableOpacity onPress={() => {setTransactionInput(""), setShowTransactionModal(false)}}>
                                <Ionicons
                                    name="close-circle-outline"
                                    color="black"
                                    size={26}
                                ></Ionicons>
                            </TouchableOpacity>
                        </View>
                        <Text style={modalStyles.modalText}>Adding a transaction at</Text>
                        <Text style={modalStyles.storeText}>{storeInformation ? storeInformation.value : ""}</Text>
                        <Text style={modalStyles.modalText}>How much did you spend?</Text>

                        {
                            displayErrorText &&
                            <Text style={modalStyles.errorText}>Please input a valid number</Text>
                        }
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <TextInput
                                style={modalStyles.manualTextInput}
                                onChangeText={(text) => updateTextInput(text)}
                                value={transactionInput}
                                placeholder={"amount in dollars"}
                                // onSubmitEditing={addTransaction}
                                keyboardType={"numeric"}
                            />
                            <TouchableOpacity onPress={() => { addTransaction(transactionInput), setTransactionInput("") }}>
                                <Ionicons
                                    name="checkmark-outline"
                                    color="black"
                                    size={26}
                                ></Ionicons>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </DismissKeyboard>
    )
}

const modalStyles = StyleSheet.create({
    modalCenteredView: {
        justifyContent: 'center',
        alignItems: 'stretch',
        margin: 22,
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
        position: 'absolute',
        top: 8, 
        left: 8
    },
    modalText: {
        marginTop: 10,
        alignSelf: 'center',
        fontSize: 16
    },
    storeText: {
        alignSelf: 'center',
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 10
    },
    manualTextInput: {
        height: 40,
        borderWidth: 1,
        margin: 15,
        marginTop: 7,
        marginBottom: 7,
        width: '80%',
        borderColor: '#F0F0F0',
        backgroundColor: '#F0F0F0',
        borderRadius: 5,
        paddingHorizontal: 10,
    },
    errorText: { 
        color: 'red', 
        textAlign: 'center'
    }
});

export { TransactionModal }