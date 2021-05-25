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
    const [userInfo, setUserInfo] = React.useState({
        name: "N/A",
        email: "N/A",
        emailVerified: false,
        lastLogin: "N/A",
        photoURL: "",}
    );

    const [emailStatus, setEmailStatus] = React.useState("Unverified");
    const [hasConstructed, setHasConstructed] = React.useState(false);

    // simulate constructor for functional components
    const constructor = () => { 
        if (hasConstructed) { 
            return;
        } else { 
            appBackend.getUserInfo().then((res) => {
                setHasConstructed(true);
                setUserInfo(res);
                if (res.emailVerified) {
                    setEmailStatus("Verified");
                } else {
                    setEmailStatus("Unverified");
                }
            });
        }
    }
    constructor();
    

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