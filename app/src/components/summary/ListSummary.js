import React from 'react';
import { StyleSheet } from 'react-native';
import { View, Text, SafeAreaView } from 'react-native';
import { ModalSlot } from './ModalSlot';

export function ListSummary(
    {
        setModalVisible,
        changeCategory,
        values
    }) {
    const categories = ['Dining', 'Grocery', 'Drugstore', 'Gas', 'Home', 'Travel', 'Others'];
    function showTransactionsModal(cat) {
        changeCategory(cat);
        setModalVisible(3);
    }
    return (
        <SafeAreaView style={styles.listContainer}>
            <View style={styles.totalContainer}>
                <Text>Total Spendings</Text>
                <Text>${(values.reduce((a, b) => a + b, 0)).toFixed(2)}</Text>
            </View>
            <View style={{marginBottom: 50}}>
                {
                    categories.map((cat, index) => { 
                        return (
                            <ModalSlot
                                key={index}
                                textString={cat}
                                selected={null}
                                setSelected={showTransactionsModal}
                                setModalVisible={null}
                                isValid={values[index] !== 0 ? true : false}
                                amountSpent={(values[index]).toFixed(2)}
                            />
                        )
                    })
                }
            </View>
        </SafeAreaView>
    )
};

const styles = StyleSheet.create({
    listContainer: {
        justifyContent: 'center',
    },
    totalContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 60,
        paddingHorizontal: 10,
        borderBottomWidth: 0.5,
        backgroundColor: 'lightgrey',
    }
});