import React from 'react'
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Footer } from '../util/Footer';

export function SpendingSummary({navigation}) {
    return (
        <SafeAreaView style={styles.screen}>
            <Text style={styles.header}>Spendings & Transactions</Text>
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
        alignItems: 'center'
    },
    header: {
        fontSize: 24,
    },
    footerContainer: { 
        width: '100%',
        backgroundColor: 'white',
        position: 'absolute', 
        bottom: 0, 
        paddingBottom: 35,
        marginTop: 0
    }
});