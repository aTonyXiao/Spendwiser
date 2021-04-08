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
import { enc } from 'crypto-js';
import * as FileSystem from 'expo-file-system';
import { Dimensions } from 'react-native';
// import Constants from 'expo-constants';

// TODO: add a "loading" or "getting results"

export function AddCardCamera({navigation}) {
    const [image, setImage] = useState(null);
    const [encodedImage, setEncodedImage] = useState(null);
    const [showBox, setShowBox] = useState(false);

    const key = process.env.REACT_NATIVE_GOOGLE_CLOUD_API_KEY;

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

    // check for image
    useEffect(() => { 
        if (encodedImage) { 
            console.log('submitting to google');
            submitToGoogle();
        }
    })

    const formatApiResponse = (responseJson) => {
        // response structure:
        // fullTextAnnotation -> pages -> blocks -> paragraphs -> words -> symbols
        let textAnnotationFormatted = [];
        let pages = responseJson.responses[0].fullTextAnnotation.pages;
        pages.forEach(page => {
            let blocks = page.blocks;
            blocks.forEach(block => {
                // no paragraphs on credit cards 
                // TODO add error checking for paragraphs
                let paragraph = block.paragraphs[0];
                let words = paragraph.words;

                let currentWord = ''
                words.forEach(word => {
                    let symbols = word.symbols;
                    for (let i = 0; i < symbols.length; i++) {
                        currentWord += symbols[i].text;
                    }
                    currentWord += " ";
                })
                textAnnotationFormatted.push(currentWord);
            })
        })
        return textAnnotationFormatted;
    }

    //https://medium.com/@mlapeter/using-google-cloud-vision-with-expo-and-react-native-7d18991da1dd
    const submitToGoogle = async () => {
        try {
            let body = JSON.stringify({
                requests: [
                    {
                        features: [
                            { type: "TEXT_DETECTION", maxResults: 5 },
                        ],
                        image: {
                            content: encodedImage
                        }
                    }
                ]
            });
            let response = await fetch(
                "https://vision.googleapis.com/v1/images:annotate?key=" + key,
                {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json"
                    },
                    method: "POST",
                    body: body
                }
            );
            let responseJson = await response.json();

            let text = formatApiResponse(responseJson);
            console.log(text);
            
        } catch (error) {
            console.log(error);
        }
    };
    
    // TODO: add functionality for from camera

    // pick from camera roll
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.cancelled) {
            const encoded = await FileSystem.readAsStringAsync(result.uri, { encoding: 'base64' });

            setImage(result.uri);
            setEncodedImage(encoded);
        }
    };

    addBox = () => { 
        console.log('hi');
        setShowBox(true);
    }

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Button title="Pick an image from camera roll" onPress={pickImage} />
            { 
                image && 
                <Image source={{ uri: image }} style={styles.img}/>
            }
            { 
                image && 
                <TouchableOpacity onPress={addBox}>
                    <Text>Add box</Text>
                </TouchableOpacity>
            }
            {/* {
                showBox &&
            } */}
        </View>
    )
}

const styles = StyleSheet.create({ 
    img: { 
        width: Dimensions.get('window').width * .80,
        height: Dimensions.get('window').height * .80
    }
})