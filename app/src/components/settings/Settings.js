import React from 'react';
import { 
    View, 
    Alert, 
    StyleSheet, 
    Image, 
    TouchableOpacity, 
    Text, 
    StatusBar, 
    SafeAreaView, 
    Dimensions 
} from 'react-native';
import { appBackend } from '../../network/backend';
import { Footer } from '../util/Footer';
import { Ionicons } from '@expo/vector-icons';
import mainStyles from '../../styles/mainStyles';
import * as storage from '../../local/storage';

/**
 * Settings page that contains a plethora of navigations to different information and buttons
 * like 'Permissions', 'Privacy', etc.
 * 
 * @param {*} props - Not currently used for anything
 */
let Settings = (props) => {
    const navigation = props.navigation;
    const width = Dimensions.get('window').width;

    function sendBackToLoadingScreen() {
        props.navigation.popToTop();
    }

    return (
        <SafeAreaView style={mainStyles.screen}>
            <View style={mainStyles.bodyContainer}>
                <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: "15%" }}>
                    <Image source={require("../../../assets/spendwiser_logo.png")}
                        style={{
                            width: width * .8,  //its same to '20%' of device width
                            aspectRatio: 5, // <-- this
                            resizeMode: 'contain', //optional
                        }}
                    />
                </View>

                <View style={styles.settingsContainer}>
                    {/* <TouchableOpacity    
                    onPress={() => {
                        Alert.alert(
                            'Tell A Friend About Us!',
                            'Find a friend near you (use whatever transportation means are necessary) and tell them all about us. Thank you.',
                            [
                                { text: "OK" }
                            ],
                            { cancelable: false }
                        );
                    }}
                    style={styles.rowContainerTop}
                >
                    <Text>Tell a Friend!</Text>
                    <Ionicons
                            name="chevron-forward-outline"
                            color="gray"
                            size={24}
                            iconStyle={{margin: 0}}
                            style={{marginRight: -8}}
                    ></Ionicons>
                </TouchableOpacity> */}

                    <TouchableOpacity
                        onPress={() => { props.navigation.navigate('Permissions') }}
                        style={styles.rowContainerTop}
                    >
                        <Text>Permissions</Text>
                        <Ionicons
                            name="chevron-forward-outline"
                            color="gray"
                            size={24}
                            style={{ marginRight: -8 }}
                        ></Ionicons>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => { props.navigation.navigate('PrivacyPolicy') }}
                        style={styles.rowContainer}
                    >
                        <Text>Privacy</Text>
                        <Ionicons
                            name="chevron-forward-outline"
                            color="gray"
                            size={24}
                            style={{ marginRight: -8 }}
                        ></Ionicons>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => props.navigation.navigate('Account')}
                        style={styles.rowContainer}
                    >
                        <Text>Account</Text>
                        <Ionicons
                            name="chevron-forward-outline"
                            color="gray"
                            size={24}
                            style={{ marginRight: -8 }}
                        ></Ionicons>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => { props.navigation.navigate('About') }}
                        style={styles.rowContainer}
                    >
                        <Text>About</Text>
                        <Ionicons
                            name="chevron-forward-outline"
                            color="gray"
                            size={24}
                            style={{ marginRight: -8 }}
                        ></Ionicons>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            appBackend.resetPassword(null, (message) => {
                                Alert.alert(
                                    "",
                                    message,
                                    [
                                        { text: "OK", onPress: () => console.log("OK Pressed") }
                                    ],
                                    { cancelable: false }
                                );
                            });
                        }}
                        style={styles.rowContainer}
                    >
                        <Text>Reset password</Text>
                        <Ionicons
                            name="chevron-forward-outline"
                            color="gray"
                            size={24}
                            style={{ marginRight: -8 }}
                        ></Ionicons>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            Alert.alert(
                                'Are you sure you would like to log out?',
                                '',
                                [
                                    {text: 'NO', onPress: () => console.log(''), style: 'cancel'},
                                    {text: 'YES', onPress: () => {
                                        appBackend.signOut(sendBackToLoadingScreen);
                                    }}
                                ]
                            );
                        }}
                        style={styles.rowContainer}
                    >
                        <Text>Logout</Text>
                        <Ionicons
                            name="chevron-forward-outline"
                            color="gray"
                            size={24}
                            style={{ marginRight: -8 }}
                        ></Ionicons>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            storage.clearLocalDB();
                        }}
                        style={styles.rowContainer}
                    >
                        <Text>DEBUG delete local storage</Text>
                        <Ionicons
                            name="chevron-forward-outline"
                            color="gray"
                            size={24}
                            style={{ marginRight: -8 }}
                        ></Ionicons>
                    </TouchableOpacity>
                    {/* <TouchableOpacity
                        onPress={() => {
                            storage.printLocalDB();
                        }}
                        style={styles.rowContainer}
                    >
                        <Text>DEBUG print local storage</Text>
                        <Ionicons
                            name="chevron-forward-outline"
                            color="gray"
                            size={24}
                            style={{ marginRight: -8 }}
                        ></Ionicons>
                    </TouchableOpacity> */}
                </View>
            </View>
            <View style={mainStyles.footerContainer}>
                <Footer navigation={navigation} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: 'white',
        height: '100%',
        paddingTop: StatusBar.currentHeight
    },
    settingsContainer: {
        flex: 1,
        backgroundColor: 'white',
        alignItems: 'center',
        paddingTop: "20%",
        marginBottom: 40,
    },
    rowContainerTop: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        padding: 20,
        paddingVertical: 5,
    },
    rowContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        padding: 20,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: 'lightgray',
    },
    footerContainer: {
        width: '100%',
        backgroundColor: 'white',
        position: 'absolute',
        bottom: 0,
        paddingBottom: 35,
        zIndex: 10,
    }
})

export { Settings };