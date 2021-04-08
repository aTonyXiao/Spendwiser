import React, { useState, useEffect } from 'react';
import { 
    Text, 
    View, 
    StyleSheet, 
    TouchableOpacity, 
    Image, 
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Dimensions } from 'react-native';
import { DragResizeBlock } from 'react-native-drag-resize';
import { captureScreen } from 'react-native-view-shot';
import { CameraSettingsBar } from './CameraSettingsBar';
import { DoubleTap } from './DoubleTap';

// TODO: add a "loading" or "getting results"
// TODO: add functionality for from camera
// TODO: move choose image functionality to ChooseImage page, 
//         this page will be for editing image before sending it to google cloud

export function EditImage({route, navigation}) {
    const image = route.params.img;
    const [encodedImage, setEncodedImage] = useState(null);
    const [showSettingsBar, setShowSettingsBar] = useState(true); // TODO: allow double tap to show/hide settings bar

    const key = process.env.REACT_NATIVE_GOOGLE_CLOUD_API_KEY;

    // once encoded image is loaded submit to google cloud
    useEffect(() => { 
        if (encodedImage) { 
            submitToGoogle();
        }
    })

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

            console.log('received text:')
            console.log(text);

        } catch (error) {
            console.log(error);
        }
    };

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

    const done = async () => {
        // capture hidden confidential information
        captureScreen({
            format: "jpg",
            quality: 0.8
        }).then(
            (async (newuri) => { 
                // encode as base 64 because google cloud needs that format
                const encoded = await FileSystem.readAsStringAsync(newuri, { encoding: 'base64' });
                setEncodedImage(encoded);
            }),
            error => console.error("Oops, snapshot failed", error)
        );
    }

    return (
        <View style={styles.container}>
            <DoubleTap onDoubleTap={()=> setShowSettingsBar(!showSettingsBar)}>
                <Image source={{ uri: image }} style={styles.img}/>
            </DoubleTap>
            {
                showSettingsBar &&
                <CameraSettingsBar/>
            }

            {/* { 
                image && 
                <TouchableOpacity onPress={done}>
                    <Text>Done!</Text>
                </TouchableOpacity>
            }
            {
                showBox &&
                <DragResizeBlock
                    x={0}
                    y={0}
                >
                    <View
                        style={{
                            width: '100%',
                            height: '100%',
                            backgroundColor: 'black',
                        }}
                    />
                </DragResizeBlock>
            } */}
        </View>
    )
}

const styles = StyleSheet.create({ 
    container: {
        flex: 1, 
        alignItems: 'center', 
        justifyContent: 'center',
        zIndex: 1 
    },
    img: { 
        width: Dimensions.get('window').width * .90,
        height: Dimensions.get('window').height * .90,
        zIndex: 1
    }, 
    box: { 
        width: 200,
        height: 300,
        backgroundColor: 'black'
    }
})