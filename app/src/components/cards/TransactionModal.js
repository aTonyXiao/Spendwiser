import React, { useState } from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { user } from '../../network/user';

function TransactionModal({
        storeInformation, 
        showTransactionModal, 
        setShowTransactionModal, 
        setHasConstructed,
        cardId,
    }) {

    const [transactionInput, setTransactionInput] = useState("");
    const userId = user.getUserId();
    const [displayErrorText, setDisplayErrorText] = React.useState(false);

    // TODO: this should also probably account for whitespace, etc.
    isInputValid = (input) => { 
        if (isNaN(parseFloat(input))) { 
            console.log('hello?')
            return false;
        }
        return !isNaN(input); 
    }

    addTransaction = () => {
        const inputIsValid = isInputValid(transactionInput);
        if (inputIsValid) { 
            user.saveTransaction(
                userId, 
                cardId, 
                {
                    storeName: storeInformation["label"],
                    address: storeInformation["vicinity"],
                    storeType: storeInformation["storeType"]
                },
                transactionInput, 
                (docId) => { 
                    user.addTransactionId(userId, docId);
                }
            );
    
            setShowTransactionModal(false);
            setHasConstructed(false);
        } else {
            setDisplayErrorText(true);

            setTimeout(function () {
                setDisplayErrorText(false);
            }, 2500)
        }
    }

    return (
        <Modal
            transparent={true}
            backdropOpacity={0.3}
            visible={showTransactionModal}
        >
            <View style={modalStyles.modalCenteredView}>
                <View style={modalStyles.modalView}>
                    <View style={modalStyles.modalHeader}>
                        <TouchableOpacity onPress={() => setShowTransactionModal(false)}>
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
                    <TextInput
                        style={modalStyles.manualTextInput}
                        onChangeText={(text) => setTransactionInput(text)}
                        value={transactionInput}
                        placeholder={"amount in dollars"}
                        onSubmitEditing={addTransaction}
                    />
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
        width: '90%',
        borderColor: '#F0F0F0',
        backgroundColor: '#F0F0F0',
        borderRadius: 5,
    },
    errorText: { 
        color: 'red', 
        textAlign: 'center'
    }
});

export { TransactionModal }