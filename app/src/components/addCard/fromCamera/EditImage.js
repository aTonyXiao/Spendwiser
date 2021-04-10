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
import { DoubleTap } from '../../util/DoubleTap';
import { MoveableBlock } from './MoveableBlock';

// TODO: add a "loading" or "getting results"
// TODO: add functionality for from camera
// TODO: move choose image functionality to ChooseImage page, 
//         this page will be for editing image before sending it to google cloud

export function EditImage({route, navigation}) {
    const image = route.params.img;
    const [encodedImage, setEncodedImage] = useState(null);
    const [showSettingsBar, setShowSettingsBar] = useState(true); // TODO: allow double tap to show/hide settings bar
    const [moveableBlocks, setMoveableBlocks] = useState([]);
    const [rerender, setRerender] = useState(false);
    const key = process.env.REACT_NATIVE_GOOGLE_CLOUD_API_KEY;
    const [sendToApi, setSendToApi] = useState(false);

    // once encoded image is loaded submit to google cloud
    useEffect(() => { 
        if (encodedImage) { 
            submitToGoogle();
        }
    })

    useEffect(()=> { 
        if (sendToApi) { 
            done();
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

            let formattedResponse = formatApiResponse(responseJson);

            navigation.navigate('CardSelectImage', {
                text: formattedResponse 
            });
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

    // pass this function to child component, calling this functino in the child component 
    // forces this component to rerender from child component
    const forceRerender = () => { 
        // it doesn't matter what variable this is, it just forces the react lifecycle 
        // to occur
        setRerender(!rerender);
    }

    return (
        <View style={styles.container}>
            {/* Blocks */}
            {
                (moveableBlocks.length > 0) && 
                <View style={{zIndex: 900}}>
                    {
                        moveableBlocks.map((isSelected, i) => {
                            return <MoveableBlock 
                                key={i} 
                                moveableBlocks={moveableBlocks} 
                                setMoveableBlocks={setMoveableBlocks}
                                forceReRender={forceRerender}
                                i={i}
                            ></MoveableBlock>
                        })
                    }
                </View>
            }

            {/* Image */}
            <DoubleTap onDoubleTap={()=> setShowSettingsBar(!showSettingsBar)}>
                <Image source={{uri: image}} style={styles.img}/>
            </DoubleTap>

            {/* Settings Bar */}
            {
                showSettingsBar &&
                <CameraSettingsBar
                    navigation={navigation}
                    moveableBlocks={moveableBlocks}
                    setMoveableBlocks={setMoveableBlocks}
                    setShowSettingsBar={setShowSettingsBar}
                    setSendToApi={setSendToApi}
                />
            }
        </View>
    )
}

const styles = StyleSheet.create({ 
    container: {
    },
    // TODO: align this pat so that it keeps photo dimensions and aligns to center
    img: { 
        width: Dimensions.get('window').width * .90,
        height: Dimensions.get('window').height * .90,
        zIndex: 1,
        alignSelf: 'center',
    }, 
    box: { 
        width: 200,
        height: 300,
        backgroundColor: 'black'
    }
})