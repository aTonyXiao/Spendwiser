import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Dimensions, Alert } from 'react-native';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';
import { user } from '../../network/user';
import { DismissKeyboard } from '../util/DismissKeyboard';

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

    // TODO: this should also probably account for whitespace, etc.
    isInputValid = (input) => { 
        if (isNaN(parseFloat(input))) { 
            return false;
        }
        return !isNaN(input); 
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
                        setHasConstructed(false);
                    }
                );
            }
            setShowTransactionModal(false);
        } else {
                setDisplayErrorText(true);

                setTimeout(function () {
                    setDisplayErrorText(false);
                }, 2500)
            }
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
                onBackdropPress={() => { setShowTransactionModal(false) }}
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
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <TextInput
                                style={modalStyles.manualTextInput}
                                onChangeText={(text) => setTransactionInput(text)}
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