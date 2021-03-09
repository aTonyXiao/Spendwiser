import React from 'react';
import { View, Text } from 'react-native';
import mainStyles from '../../styles/mainStyles';
import { appBackend } from '../../network/backend';

/**
 * Displays the account information of a currently signed in user 
 * @namespace Account
 * @param {Object} props 
 */
let Account = function(props) {
    let userInfo = appBackend.getUserInfo();
    let emailStatus = userInfo.emailVerified ? "Verified" : "Unverified";
    return(
        <View style={mainStyles.container}>
            <Text style={mainStyles.large_title}>Your Account</Text>
            <Text>Name: {userInfo.name}</Text>
            <Text>Email: {userInfo.email}</Text>
            <Text>Email Verification Status: {emailStatus}</Text>
        </View>
    )
}

export { Account };