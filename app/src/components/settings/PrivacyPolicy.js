import React from 'react';
import { Dimensions, ScrollView, SafeAreaView, StyleSheet, StatusBar } from 'react-native';
import HTML from 'react-native-render-html';
import {privacyContent} from './privacyContent';
const width = Dimensions.get('window').width;

export function PrivacyPolicy(props) {
    const htmlPrivacy = privacyContent;

    return(
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.htmlContainer}>
                <HTML source={{html: htmlPrivacy}} contentWidth={width} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: StatusBar.currentHeight,
    },
    button: {
        alignItems: "center",
        backgroundColor: "#28b573",
        padding: 10
    },
    htmlContainer: {
        padding: 10,
    },
});
