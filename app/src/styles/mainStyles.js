import { StyleSheet, StatusBar, Platform } from 'react-native';

/**
 * The global styles for the app
 */
const mainStyles = StyleSheet.create({
    screen: {
        backgroundColor: 'white',
        height: '100%',
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    },
    bodyContainer: {
        flex: 1,
        zIndex: Platform.OS === 'ios' ? 0 : 1,
    },
    container: {
        flex: 1,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
    },
    footerContainer: {
        alignSelf: "flex-end",
        width: '100%',
        zIndex: 10,
    },
    titleAligned: {
        fontSize: 24,
        fontWeight: "bold",
        color: '#28b573',
        textAlign: 'center',
        // marginTop: 50 // comment this out for no padding
    }
});

export default mainStyles;