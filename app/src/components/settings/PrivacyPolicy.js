import React from 'react';
import { Dimensions, ScrollView, SafeAreaView, StyleSheet, View } from 'react-native';
import HTML from 'react-native-render-html';
import mainStyles from '../../styles/mainStyles';
import { BackButtonHeader } from '../util/BackButtonHeader';
import {privacyContent} from './privacyContent';
const width = Dimensions.get('window').width;

export function PrivacyPolicy(props) {
    const htmlPrivacy = privacyContent;

    return(
        <SafeAreaView style={mainStyles.screen}>
            <BackButtonHeader navigation={props.navigation} />
            <View style={[mainStyles.bodyContainer, styles.container]}>
                <ScrollView style={styles.htmlContainer}>
                    <HTML source={{html: htmlPrivacy}} contentWidth={width} />
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    button: {
        alignItems: "center",
        backgroundColor: "#28b573",
        padding: 10
    },
    htmlContainer: {
        padding: 10,
        paddingTop: 0
    },
});
