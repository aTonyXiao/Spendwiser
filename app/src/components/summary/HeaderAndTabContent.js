import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Modal from 'react-native-modal';
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
        whichPeriod,
        setWhichPeriod,
    }) {
    const [pickerVisible, setPickerVisible] = useState(false);
    const deviceHeight =
    Platform.OS === 'ios'
    ? Dimensions.get('window').height
    : Dimensions.get('screen').height;
    
    return (
        <View style={{flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', width: '100%'}}>
            {/* Month Picker */}
            {pickerVisible && <Modal
               backdropOpacity={0.3}
                isVisible={pickerVisible}
                statusBarTranslucent={true}
                deviceHeight={deviceHeight}
                avoidKeyboard={true}
                style={{
                    margin: 0,
                    marginHorizontal: 0,
                    justifyContent: 'flex-end',
                }}
                onBackdropPress={()=> {setPickerVisible(false)}}
            >
                <View style={modalStyles.modalCenteredView}>
                    <View style={modalStyles.modalView}>
                        {/* Modal header */}
                        <View style={modalStyles.modalHeader}>
                            <TouchableOpacity onPress={() => {setPickerVisible(false)}}>
                                <Ionicons
                                    name="close-circle-outline"
                                    color="black"
                                    size={26}
                                ></Ionicons>
                            </TouchableOpacity>
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
                <Text style={styles.header}>Spendings</Text>
                <Ionicons
                    name="ellipsis-horizontal-circle"
                    color={'black'}
                    size={30}
                    onPress={()=> {
                        setModalVisible(modalType.CARDS);
                    }}
                ></Ionicons>
            </View>
            {/* Current Card */}
            <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                <Ionicons
                    name="card-outline"
                    color={"black"}
                    size={15}
                    style={{paddingRight: 5}}
                ></Ionicons>
                <Text>{curCard === null ? "All Cards" : curCard["cardName"]}</Text>
            </View>
            {/* Tabs */}
            <View style={styles.tabContainer}>
                {/* Tabs */}
                <View style={styles.tab}>
                    <TouchableOpacity
                        style={{flex: 1, alignItems: 'center', flexDirection: 'column'}}
                        onPress={() => {mode === modeType.SUMMARY ?
                                    setModalVisible(modalType.TIME) : (setWhichPeriod(1), setPickerVisible(true))}}
                    >
                        <Text>{mode !== modeType.COMPARE ? "Time Period" : "1st period"}</Text>
                        <View style={{flexDirection:'row', alignItems: 'flex-end', justifyContent: 'center'}}>
                            <Text style={{color: 'blue'}}>
                                {mode === modeType.SUMMARY ? curTimeframe
                                : `${months[compareTimeframe[0].getMonth()]} ${compareTimeframe[0].getFullYear()}`}
                            </Text>
                            <Ionicons
                                name="chevron-down"
                                color={mode === modeType.SUMMARY ? "blue" : "darkgrey"}
                                size={15}
                            ></Ionicons>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{flex: 1, alignItems: 'center', flexDirection: 'column'}}
                        onPress={() => {setModalVisible(modalType.MODE)}}
                    >
                        <Text>Mode</Text>
                        <View style={{flexDirection:'row', alignItems: 'flex-end', justifyContent: 'center'}}>
                            <Text style={{color: 'blue'}}>{mode}</Text>
                            <Ionicons
                                name="chevron-down"
                                color="blue"
                                size={15}
                            ></Ionicons>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{flex: 1, alignItems: 'center', flexDirection: 'column'}}
                        onPress={() => {mode === modeType.SUMMARY ? setModalVisible(modalType.CATEGORY)
                                : mode === modeType.BUDGET ? setModalVisible(modalType.LIMITS)
                                : (setWhichPeriod(2), setPickerVisible(true))}}
                    >
                        <Text>{mode !== modeType.COMPARE ? "Category" : "2nd period"}</Text>
                        <View style={{flexDirection:'row', alignItems: 'flex-end', justifyContent: 'center'}}>
                            <Text style={{color: "blue"}}>
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
                    </TouchableOpacity>
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
        marginBottom: -20,
        zIndex: 1,
    },
});