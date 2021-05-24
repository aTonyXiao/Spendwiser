import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function BackButtonHeader (props) {
    const navigation = props.navigation;

    return (
        <View style={{ width: "100%", height: props.height, alignSelf: "flex-start", flexDirection: "row", paddingTop: 10, paddingBottom: 10 }}>
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
            <View style={{ flexShrink: 1, flexGrow: 1, justifyContent: "center", flexBasis: "auto" }}>
                <Text style={typeof props.titleStyle === "undefined" ? { fontSize: 22 } : props.titleStyle }>
                    {typeof props.title === "undefined" ? "" : props.title }
                </Text>
            </View>
            {/* Hacky centering */}
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