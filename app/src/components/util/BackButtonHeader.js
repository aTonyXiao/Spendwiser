import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * The component that will be used for the header (for titles and back buttons)
 * 
 * @param {*} navigation - The navigation instance so that it can activate "goBack"
 * @param {string} title - The title that will be used in this component
 * @param {*} titleStyle - The style of the title that will be used in this component
 * 
 * @example <BackButtonHeader navigation={props.navigation} title={"Your Account"} titleStyle={mainStyles.titleAligned} />
 * 
 * @module BackButtonHeader
 */
export function BackButtonHeader (props) {
    // the navigation instance passed in as a property
    const navigation = props.navigation;

    return (
        <View style={{ width: "100%", height: props.height, alignSelf: "flex-start", flexDirection: "row", paddingTop: 10, paddingBottom: 10 }}>
            {/* The back button */}
            <View style={{ flexShrink: 0, marginRight: 10 }}>
                <TouchableOpacity style={{ flexDirection: "row", alignItems: "center" }} 
                              onPress={() => { props.navigation.goBack() }} >
                <Ionicons name="chevron-back-outline"
                          color="#28b573"
                          size={32} />
                <Text style={{fontSize: 22, color: "#28b573"}}>
                    Back
                </Text>
            </TouchableOpacity>
            </View>
            {/* The title */}
            <View style={{ flexShrink: 1, flexGrow: 1, justifyContent: "center", flexBasis: "auto" }}>
                <Text style={typeof props.titleStyle === "undefined" ? { fontSize: 22 } : props.titleStyle }>
                    {typeof props.title === "undefined" ? "" : props.title }
                </Text>
            </View>
            {/* Hacky centering, literal duplicate of the back button */}
            <View style={{ flexShrink: 0, marginLeft: 10, flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="chevron-back-outline"
                          color="white"
                          size={32} />
                <Text style={{fontSize: 22, color: "white"}}>
                    Back
                </Text>
            </View>
        </View>
    );
}