import React from 'react';
import { 
    Text, 
    View, 
    TouchableOpacity, 
    StyleSheet,
    SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import mainStyles from '../../../styles/mainStyles';
import { BackButtonHeader } from '../../util/BackButtonHeader';

// TODO: need to add permission to settings page

/**
 * Page for choosing an image. Utilizes Expo ImagePicker to allow user to pick from
 * camera roll or take picture
 * 
 * @param {{Object}} obj - navigation passed directly to display card
 * @param {Object} obj.navigation - navigation object used to move between different pages
 * @module ChooseImage
 */
export function ChooseImage({navigation}) {
    
    getCameraRollPermissions = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Sorry, we need camera roll permissions to make this work!');
            return false;
        }

        return true;
    }

    getPhotoPermissions = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            alert('Sorry, we need camera permissions to make this work!');
            return false;
        }     

        return true;
    }

    // pick from camera roll
    const launchCameraRoll = async () => {
        let allowed = await getCameraRollPermissions();

        if (allowed) {
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
        }
    };

    // take photo
    takePhoto = async () => {
        let allowed = await getPhotoPermissions();

        if (allowed) { 
            let result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 3],
            });
    
            if (!result.cancelled) {
                navigation.navigate('EditImage', {
                    img: result.uri 
                })
            }
        }
    };

    return(
        <SafeAreaView style={mainStyles.screen}>
            <BackButtonHeader navigation={navigation} title={"Search Card from Photo"} titleStyle={mainStyles.titleNoPadding}/>
            <View style={[mainStyles.bodyContainer, styles.container]}>
                <View style={{alignItems: 'center'}}>
                    <Text style={styles.txt}>Camera Roll</Text>
                    <TouchableOpacity 
                        onPress={launchCameraRoll}
                        style={styles.icon}
                    >
                        <Ionicons
                            name="image-outline"
                            color="black"
                            size={40}
                        ></Ionicons>
                    </TouchableOpacity>
                </View>
                <View style={{alignItems: 'center'}}>
                    <Text style={styles.txt}>Take a Photo</Text>
                    <TouchableOpacity onPress={takePhoto}>
                        <Ionicons
                            name="camera-outline"
                            color="black"
                            size={40}
                        ></Ionicons>
                    </TouchableOpacity>
               </View>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: { 
        alignItems: 'center', 
        justifyContent: 'space-evenly' 
    },
    txt: {
        fontSize: 18,
        margin: 10
    },
    icon: {
        marginBottom: 15
    }
})