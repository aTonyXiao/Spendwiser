import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function ModalSlot(
    {
        textString,
        selected,
        setSelected,
        setModalVisible,
        isValid,
    }) {
    return (
        <TouchableOpacity 
            style={styles.slot}
            onPress={() => {isValid && setSelected(textString), isValid && setModalVisible(0)}}
        >
            <Text style={isValid ? styles.textValid : styles.textInvalid}>{textString}</Text>
            {selected === true ? 
                <Ionicons
                    name="checkmark-sharp"
                    color="blue"
                    size={24}
                ></Ionicons>
                :
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
        borderBottomWidth: 0.5
    },
    textValid: {
        color: 'black'
    },
    textInvalid: {
        color: 'grey'
    }
});