import React, { useState } from 'react';
import { 
    View, 
    StyleSheet, 
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HelpModal } from './HelpModal';

/**
 * Child component header bar that gives options to user while editing image
 * 
 * @param {{Object, Array, Object, Object, Object}} obj - The route and navigation passed directly to display card
 * @param {Object} obj.navigation - navigation object used to move between different pages
 * @param {Array} obj.moveableBlocks - list of booleans that represent selected/unselected boxes on screen
 * @param {Object} obj.setMoveableBlocks - React useState function sets moveableBlocks array
 * @param {Object} obj.setShowSettingsBar - React useState function that sets showSettingsBar boolean
 * @param {Object} obj.setSendToApi - React useState function that sets sendToApi boolean
 * @module CameraSettingsBar
 */
export function CameraSettingsBar({navigation, moveableBlocks, setMoveableBlocks, setShowSettingsBar, setSendToApi, forceReRender}) {
    const showDeleteIcon = (moveableBlocks.length > 0);
    const [showHelpModal, setShowHelpModal] = useState(false); //useState(showOnStart);

    const goBack = () => {
        navigation.navigate('ChooseImage');
    } 

    // TODO: need to add some code for checking if no box is currently selected, OR
    //  only show this option when a box is selected
    const deleteBox = () => {
        let newBlocks = moveableBlocks;
        newBlocks.pop();
        setMoveableBlocks(newBlocks);
        forceReRender();
    }

    const addBlock = () => {
        let newBlocks = moveableBlocks;
        for (let j=0 ; j<newBlocks.length; j++) { 
            newBlocks[j] = false;
        }
        newBlocks.push(true);
        setMoveableBlocks(newBlocks);
        forceReRender();
    }

    const showHelp = () => { 
        setShowHelpModal(true);
    }

    const callDone = () => {
        setShowSettingsBar(false);
        setSendToApi(true);
    }

    return (
        <View style={styles.container}>
            <HelpModal
                showHelpModal={showHelpModal}
                setShowHelpModal={setShowHelpModal}
            ></HelpModal>

            {/* Go Back */}
            <View style={styles.leftContainer}>
                <TouchableOpacity 
                    onPress={goBack}
                    style={styles.icon}
                >
                    <Ionicons
                        name="arrow-back-outline"
                        color="black"
                        size={32}
                    ></Ionicons>
                </TouchableOpacity>
            </View>

            <View style={styles.rightContainer}>
                {/* Help */}
                <TouchableOpacity 
                    onPress={showHelp}
                    style={styles.icon}
                >
                    <Ionicons
                        name="help-circle-outline"
                        color="black"
                        size={32}
                    ></Ionicons>
                </TouchableOpacity>

                {/* Delete */}
                {
                    showDeleteIcon &&
                    <TouchableOpacity
                        onPress={deleteBox}
                        style={styles.icon}
                    >
                        <Ionicons
                            name="close-outline"
                            color="black"
                            size={32}
                        ></Ionicons>
                    </TouchableOpacity>
                }
                {
                    !showDeleteIcon && 
                    <TouchableOpacity
                        style={styles.icon}
                    >
                        <Ionicons
                            name="close-outline"
                            color="lightgray"
                            size={32}
                        ></Ionicons>
                    </TouchableOpacity>
                }

                {/* Add box */}
                <TouchableOpacity 
                    onPress={addBlock}
                    style={styles.icon}
                >
                    <Ionicons
                        name="add-outline"
                        color="black"
                        size={32}
                    ></Ionicons>
                </TouchableOpacity>

                {/* Done */}
                <TouchableOpacity 
                    onPress={callDone}
                    style={styles.icon}
                >
                    <Ionicons
                        name="checkmark-outline"
                        color="black"
                        size={32}
                    ></Ionicons>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { 
        width: '100%',
        position: 'absolute',
        zIndex: 999,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    leftContainer: {
        top: 15,
        margin: 10, 
        opacity: 1,
    },
    rightContainer: {
        top: 15,
        display: 'flex',
        flexDirection: 'row',
        margin: 10,
        opacity: 1
    },
    icon: {
        margin: 10
    },
})