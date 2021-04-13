import React, { useState } from 'react'
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Footer } from '../util/Footer';
import { CategoryModal } from './CategoryModal';
import PieChartSummary from './PieChartSummary';

const modalType = {
    DISABLED: 0,
    TIME: 1,
    CATEGORY: 2,
}

export function SpendingSummary({navigation}) {
    const [modalVisible, setModalVisible] = useState(modalType.DISABLED);
    const [curCategory, setCurCategory] = useState('All categories');
    const [curTimeframe, setCurTimeframe] = useState('This month');
    return (
        <SafeAreaView style={styles.screen}>
            <CategoryModal
                modalType = {modalType}
                modalVisible = {modalVisible}
                setModalVisible = {setModalVisible}
                curTimeframe = {curTimeframe}
                setCurTimeframe = {setCurTimeframe}
                curCategory = {curCategory}
                setCurCategory = { setCurCategory}
            />
            <Text style={styles.header}>Spendings & Transactions</Text>
            {/* Tabs */}
            <View style={styles.tabContainer}>
                <View style={styles.tab}>
                    <Text>Time period</Text>
                    <Text>Category</Text>
                </View>
                <View style={styles.tab}>
                    <Text 
                        style={{color: 'blue'}}
                        onPress={() => {setModalVisible(modalType.TIME)}}
                    >{curTimeframe}</Text>
                    <Text 
                        style={{color: 'blue'}}
                        onPress={() => {setModalVisible(modalType.CATEGORY)}}
                    >{curCategory}</Text>
                </View>
            </View>
            {/* Content */}
            <View style={styles.contentContainer}>
                <PieChartSummary style={{height:500}}/>
            </View>
            {/* Footer */}
            <View style={styles.footerContainer}>
                <Footer navigation={navigation} />
            </View>
        </SafeAreaView>
    )
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: 'white',
        height: '100%',
        paddingTop: StatusBar.currentHeight,
        alignItems: 'center',
        flexDirection: 'column',
    },
    header: {
        fontSize: 24,
        paddingTop: 10,
    },
    tabContainer: {
        marginTop: 10,
        width: '100%',
        paddingHorizontal: 20,
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    tab: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    contentContainer: {
        flex: 1,
        width: '100%',
    },
    footerContainer: { 
        width: '100%',
        backgroundColor: 'white',
        // position: 'absolute', 
        bottom: 0, 
        paddingBottom: 35,
        marginTop: 0
    }
});