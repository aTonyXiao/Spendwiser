import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Display modal for Spend Analyzer.
 * @param {Object} obj - Object from CategoryModal to be passed here
 * @param {string} obj.textString - Text to display in modal slot
 * @param {boolean} obj.selected -  State of whether the modal slot is currently selected by user. null if modal doesnt use selected items
 * @param {function} obj.setSelected - Callback function to set user's currently selected item. Depends on type of modal. null if modal doesnt use selected items
 * @param {function} obj.setModalVisible - Function to set the state of modalVisible
 * @param {boolean} obj.isValid - Boolean to determine if the touchable opacity is clickable
 * @param {float} obj.amountSpent - Float value of amount spent to display for transaction modal. null if used for other modals
 * @module ModalSlot
 * @see SpendingSummary
 * @see CategoryModal
 */
export function ModalSlot(
    {
        textString,
        selected,
        setSelected,
        setModalVisible,
        isValid,
        amountSpent,
    }) {
    return (
        <TouchableOpacity 
            style={amountSpent !== null ? styles.transactionSlot : styles.slot}
            onPress={() => {isValid && setSelected(textString), (isValid && setModalVisible !== null) && setModalVisible(0)}}
        >
            <Text style={amountSpent !== null || isValid ? styles.textValid : styles.textInvalid}>{textString}</Text>
            {selected === true ? 
                <Ionicons
                    name="checkmark-sharp"
                    color="blue"
                    size={24}
                ></Ionicons>
                :
                amountSpent !== null ? <Text>${amountSpent}</Text> :
                <View></View>
            }
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    slot: {
        width: '100%',
        height: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
        borderBottomWidth: 0.4
    },
    transactionSlot: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
        borderBottomWidth: 0.4
    },
    textValid: {
        color: 'black'
    },
    textInvalid: {
        color: 'grey'
    }
});