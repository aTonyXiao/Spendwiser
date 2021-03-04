import React from 'react';
import { View, Button, Alert, Text } from 'react-native';
import mainStyles from '../styles/mainStyles';
import { appBackend } from '../network/backend';
import CachedImage from 'react-native-expo-cached-image';

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
            <CachedImage
                style={[{justifyContent: 'center', alignItems: 'center'}, props.style]}
                source={userInfo.photoURL}
                onLoad={() => {
                    console.log("Image loaded");
                }}
            />
            <Text>Name: {userInfo.name}</Text>
            <Text>Email: {userInfo.email}</Text>
            <Text>Email Verification Status: {emailStatus}</Text>
        </View>
    )
}

export { Account };