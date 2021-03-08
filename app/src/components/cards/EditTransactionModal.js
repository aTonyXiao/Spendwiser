import React, { useState } from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { user } from '../../network/user';


function EditTransactionModal({transaction, modalVisible, setModalVisible, setHasConstructed}) {
    const [transactionInput, setTransactionInput] = useState("");
    const [displayErrorText, setDisplayErrorText] = React.useState(false);
    const userId = user.getUserId();
    // handle no currently selected document
    var docId;
    if (transaction) { 
        docId = transaction.docId;
    }

    // TODO: this should also probably account for whitespace, etc.
    validateInput = (input) => { 
        return !isNaN(input); 
    }

    editTransaction = () => {
        const inputIsValid = validateInput(transactionInput);
        if (inputIsValid) {
            user.editTransaction(
                userId,
                docId,
                {
                    amountSpent: transactionInput
                }
            )
            setModalVisible(false);
            setHasConstructed(false);
        } else {
            setDisplayErrorText(true);

            setTimeout(function () {
                setDisplayErrorText(false);
            }, 2000)
        }
    }

    confirmDeleteTransaction = () => {
        Alert.alert(
            'Are you sure you would like to delete this transaction from your profile?',
            'please select one',
            [
              {text: 'NO', onPress: () => console.log(''), style: 'cancel'},
              {text: 'YES', onPress: () => deleteTransaction()},
            ]
          );
    };

    deleteTransaction = () => { 
        user.deleteTransaction(userId, docId);
        setModalVisible(false);
        setHasConstructed(false);
    }

    return (
        <Modal
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
                        <Text>Amount wrong? Input a new amount</Text>
                        {
                            displayErrorText &&
                            <Text style={modalStyles.errorText}>Please input a valid number</Text>
                        }
                        <TextInput
                            style={modalStyles.manualTextInput}
                            onChangeText={(text) => setTransactionInput(text)}
                            value={transactionInput}
                            placeholder={"amount in dollars"}
                            onSubmitEditing={editTransaction}
                        />

                        <TouchableOpacity
                            onPress={confirmDeleteTransaction}
                        >
                            <Text style={modalStyles.deleteText}>Delete this transaction</Text>
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
        alignItems: 'center',
        marginTop: -16
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
    deleteText: { 
        marginTop: 25,
        marginBottom: 5,
        color: 'red'
    },
    errorText: { 
        color: 'red', 
        textAlign: 'center'
    }
});

export { EditTransactionModal };