import React, { useState, useEffect } from 'react';
import { 
    Text, 
    View, 
    TouchableOpacity, 
    Platform,
    StyleSheet
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export function ChooseImage({navigation}) {
    // TODO: need to add permission to settings page
    // get permissions
    useEffect(() => {
        (async () => {
            if (Platform.OS !== 'web') {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                    alert('Sorry, we need camera roll permissions to make this work!');
                }
            }
        })();
    }, []);

    // pick from camera roll
    const launchCameraRoll = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.cancelled) {
            navigation.navigate('EditImage', {
                img: result.uri 
            })
        }
    };

    // take photo
    takePhoto = async () => {
        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
        });

        if (!result.cancelled) {
            navigation.navigate('EditImage', {
                img: result.uri 
            })
        }
    };

    return(
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <TouchableOpacity onPress={launchCameraRoll}>
                <Text style={styles.txt}>Pick an image from camera roll</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={takePhoto}>
                <Text style={styles.txt}>Take a photo</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    txt: {
        fontSize: 18,
        margin: 10
    }
})