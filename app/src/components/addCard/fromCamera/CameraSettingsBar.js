import React, { useState, useEffect } from 'react';
import { 
    Text, 
    View, 
    StyleSheet, 
    TouchableOpacity, 
    Platform,
    Image, 
    Button 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Dimensions } from 'react-native';
import { DragResizeBlock } from 'react-native-drag-resize';
import { captureScreen } from "react-native-view-shot";

// TODO: implement functionality here

export function CameraSettingsBar({navigation, moveableBlocks, setMoveableBlocks}) {
    const addBlock = () => {
        console.log("adding block");
        setMoveableBlocks([
            ...moveableBlocks,
            false
        ])
    }

    return(
        <View style={styles.container}>
            <TouchableOpacity>
                <Text style={styles.txt}>Choose different image</Text>
            </TouchableOpacity>
            <TouchableOpacity>
                <Text style={styles.txt}>Delete Box</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={addBlock}>
                <Text style={styles.txt}>Add Another Box</Text>
            </TouchableOpacity>
            <TouchableOpacity>
                <Text style={styles.txt}>?</Text>
            </TouchableOpacity>
            <TouchableOpacity>
                <Text style={styles.txt}>Done!</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { 
        width: '100%',
        position: 'absolute',
        top: 30,
        backgroundColor: 'white',
        zIndex: 999
    },
    txt: {
        fontSize: 18,
        margin: 10, 
    }
})