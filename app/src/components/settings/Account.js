import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import mainStyles from '../../styles/mainStyles';
import { appBackend } from '../../network/backend';
import { BackButtonHeader } from '../util/BackButtonHeader';

/**
 * Displays the account information of a currently signed in user 
 * @namespace Account
 * @param {Object} props 
 */
let Account = function(props) {
    let userInfo = appBackend.getUserInfo();
    let emailStatus = userInfo.emailVerified ? "Verified" : "Unverified";
    return(
        <SafeAreaView style={mainStyles.screen}>
            <BackButtonHeader navigation={props.navigation} title={"Your Account"} titleStyle={mainStyles.titleNoPadding} />
            <View style={[mainStyles.bodyContainer, mainStyles.container]}>
            <Text>Name: {userInfo.name}</Text>
            <Text>Email: {userInfo.email}</Text>
            <Text>Email Verification Status: {emailStatus}</Text>
            </View>
        </SafeAreaView>
    )
}

export { Account };