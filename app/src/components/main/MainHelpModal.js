import React from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';

export function MainHelpModal(
    {
        helpModalVisible,
        setHelpModalVisible
    }) {
    const deviceHeight =
        Platform.OS === 'ios'
        ? Dimensions.get('window').height
        : Dimensions.get('screen').height;

    return (
        <Modal
            backdropOpacity={0.3}
            isVisible={helpModalVisible}
            statusBarTranslucent={true}
            deviceHeight={deviceHeight}
            style={{
                margin: 0,
                marginHorizontal: 0,
                justifyContent: 'center',
            }}
            onBackdropPress={()=> {setHelpModalVisible(false)}}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            onPress={() => { setHelpModalVisible(false) }}
                            style={styles.icon}
                        >
                            <Ionicons
                                name="close-circle-outline"
                                color="black"
                                size={26}
                            ></Ionicons>
                        </TouchableOpacity>
                    </View>
                    {/* Body */}
                    <View style={{paddingHorizontal: 15}}>
                            <Text style={styles.text}>Navigation button to re-center your location</Text>
                            <Text style={styles.text}>Search button to select a store from a list of nearby stores</Text>
                            <Text style={styles.text}>Click an icon on Google Maps to select that particular store</Text>
                            <Text style={styles.text}>Swipe the bottom panel up to view recommended cards</Text>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    centeredView: {
        justifyContent: 'center',
        alignItems: 'stretch',
        backgroundColor: 'rgba(128, 128, 128, 0.5)',
        marginHorizontal: 15,
    },
    modalView: {
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'stretch',
        borderRadius: 4,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    header: {
        display: 'flex',
        flexDirection: 'row',
    },
    text: { 
        marginVertical: 5,
        marginHorizontal: 10,
    },
    icon: { 
        marginTop: 8,
        marginLeft: 8
    },
});