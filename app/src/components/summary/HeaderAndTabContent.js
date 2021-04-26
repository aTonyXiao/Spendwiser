import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DatePicker, { getFormatedDate }from 'react-native-modern-datepicker';

const months = [
    "January", "February", 
    "March", "April", "May", 
    "June", "July", "August",
    "September", "October", 
    "November", "December"
];

export function HeaderAndTabContent(
    {
        modalType,
        curCard,
        curTimeframe,
        mode,
        modeType,
        curCategory,
        setModalVisible,
        compareTimeframe,
        setNewPeriod,
        setWhichPeriod,
    }) {
    const [pickerVisible, setPickerVisible] = useState(false);

    return (
        <View style={{flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', width: '100%'}}>
            {/* Month Picker */}
            {pickerVisible && <Modal
                animationType="slide"
                transparent={true}
                backdropOpacity={0.3}
                statusBarTranslucent={true}
                visible={pickerVisible}
            >
                <View style={modalStyles.modalCenteredView}>
                    <View style={modalStyles.modalView}>
                        {/* Modal header */}
                        <View style={modalStyles.modalHeader}>
                            <TouchableOpacity style={{flex: 1}} onPress={() => {setPickerVisible(false)}}>
                                <Ionicons
                                    name="close-circle-outline"
                                    color="black"
                                    size={26}
                                ></Ionicons>
                            </TouchableOpacity>
                            <View style= {{flex: 1}}></View>
                        </View>
                        <DatePicker
                            mode="monthYear"
                            selectorStartingYear={2020}
                            onMonthYearChange={selectedDate => (setNewPeriod(selectedDate), setPickerVisible(false))}
                        />
                    </View>
                </View>
            </Modal>
            }
            {/* Header */}
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: 10}}>
                <Ionicons
                    name="ellipsis-horizontal-circle"
                    color={'white'}
                    size={30}
                ></Ionicons>
                <Text style={styles.header}>Spendings & Transactions</Text>
                <Ionicons
                    name="ellipsis-horizontal-circle"
                    color={'black'}
                    size={30}
                    onPress={()=> {
                        setModalVisible(modalType.CARDS);
                    }}
                ></Ionicons>
            </View>
             <Text>{curCard === null ? "All Cards" : curCard["cardName"]}</Text>
            {/* Tabs */}
            <View style={styles.tabContainer}>
                {/* Tab Headers */}
                <View style={styles.tab}>
                    <View style={{flex: 1, alignItems: 'center'}}>
                        <Text>{mode !== modeType.COMPARE ? "Time Period" : "1st period"}</Text>
                    </View>
                    <View style={{flex: 1, alignItems: 'center'}}><Text>Mode</Text></View>
                    <View style={{flex: 1, alignItems: 'center'}}>
                        <Text>{mode !== modeType.COMPARE ? "Category" : "2nd period"}</Text>
                    </View>
                </View>
                {/* Tab Content */}
                <View style={styles.tab}>
                    <View style={{flex: 1, flexDirection:'row', alignItems: 'flex-end', justifyContent: 'center'}}>
                        <Text 
                            style={{color: 'blue'}}
                            onPress={() => {mode === modeType.SUMMARY ?
                                setModalVisible(modalType.TIME) : (setWhichPeriod(1), setPickerVisible(true))}
                            }>
                            {mode === modeType.SUMMARY ? curTimeframe
                            : `${months[compareTimeframe[0].getMonth()]} ${compareTimeframe[0].getFullYear()}`}
                        </Text>
                        <Ionicons
                            name="chevron-down"
                            color={mode === modeType.SUMMARY ? "blue" : "darkgrey"}
                            size={15}
                        ></Ionicons>
                    </View>
                    <View style={{flex: 1, flexDirection:'row', alignItems: 'flex-end', justifyContent: 'center'}}>

                        <Text 
                            style={{color: 'blue'}}
                            onPress={() => {setModalVisible(modalType.MODE)}}
                        >{mode}</Text>
                        <Ionicons
                            name="chevron-down"
                            color="blue"
                            size={15}
                        ></Ionicons>
                    </View>
                    <View style={{flex: 1,flexDirection:'row', alignItems: 'flex-end', justifyContent: 'center'}}>
                        <Text 
                            style={{color: "blue"}}
                            onPress={() => {mode === modeType.SUMMARY ? setModalVisible(modalType.TIME)
                            : mode === modeType.BUDGET ? setModalVisible(modalType.LIMITS)
                            : (setWhichPeriod(2), setPickerVisible(true))}
                            }>
                            {mode === modeType.SUMMARY ? curCategory.label
                            : mode === modeType.BUDGET ? "Limits"
                            : `${months[compareTimeframe[1].getMonth()]} ${compareTimeframe[1].getFullYear()}`}
                        </Text>
                        <Ionicons
                            name="chevron-down"
                            color={"blue"}
                            size={15}
                        ></Ionicons>
                    </View>
                </View>
            </View>     
        </View>
          
    );
}

const styles = StyleSheet.create({
    header: {
        fontSize: 20,
    },
    tabContainer: {
        marginTop: 10,
        width: '100%',
        flexDirection: 'column',
        justifyContent: 'space-between',
        paddingBottom: 10,
        borderBottomWidth: 0.5,
    },
    tab: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
});

const modalStyles = StyleSheet.create({
    modalCenteredView: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'stretch',
        backgroundColor: 'rgba(128, 128, 128, 0.5)'
    },
    modalView: {
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'stretch',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    modalHeader: { 
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        margin: 8,
        marginBottom: 0,
    },
});