import React from 'react';
import { View, Alert, StyleSheet, TouchableOpacity, Text, StatusBar, SafeAreaView } from 'react-native';
import mainStyles from '../styles/mainStyles';
import { appBackend } from '../network/backend';
import { Footer } from './util/Footer';
import { Ionicons } from '@expo/vector-icons';

/**
 * Settings page that contains a plethora of navigations to different information and buttons
 * like 'Permissions', 'Privacy', etc.
 * 
 * @param {*} props - Not currently used for anything
 */
let Settings = (props) => {
    const navigation = props.navigation;

    return(
        <SafeAreaView style={styles.screen}>
            <View style={mainStyles.container}>
                <Text style={mainStyles.large_title}>SpendWiser</Text>
                <TouchableOpacity    
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
                            size={32}
                    ></Ionicons>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => { props.navigation.navigate('Permissions') }}
                    style={styles.rowContainer}
                >
                    <Text>Notifications</Text>
                    <Ionicons
                            name="chevron-forward-outline"
                            color="gray"
                            size={32}
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
                            size={32}
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
                            size={32}
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
                            size={32}
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
                            size={32}
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
                                    appBackend.signOut();
                                    props.navigation.navigate('Login');
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
                            size={32}
                    ></Ionicons>
                </TouchableOpacity>
            </View>
            <Footer navigation={navigation} />
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
    rowContainerTop: {
        display: 'flex', 
        flexDirection: 'row', 
        justifyContent: 'space-between',
        alignItems: 'center', 
        width: '100%', 
        padding: 20,
        paddingTop: 5,
        paddingBottom: 5,
    },
    rowContainer: {
        display: 'flex', 
        flexDirection: 'row', 
        justifyContent: 'space-between',
        alignItems: 'center', 
        width: '100%', 
        padding: 20,
        paddingTop: 5,
        paddingBottom: 5,
        borderTopWidth: 1,
        borderTopColor: 'lightgray',
    },
    footerContainer: { 
        width: '100%',
        backgroundColor: 'white',
        position: 'absolute', 
        bottom: 0, 
        paddingBottom: 15,
        marginTop: 0
    }
})

export { Settings };