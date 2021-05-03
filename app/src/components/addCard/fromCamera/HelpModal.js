import React, { useState } from 'react';
import { 
    View, 
    StyleSheet, 
    TouchableOpacity,
    Text,
    Button
} from 'react-native';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';
import SelectMultiple from 'react-native-select-multiple';
import * as storage from '../../../local/storage';

/**
 * Modal that shows help for editing an image
 * 
 * @param {{Object}} obj - navigation passed directly to display card
 * @param {boolean} obj.showHelpModal - boolean to show help modal or not
 * @param {function} obj.setShowHelpModal - React use state function to set showHelpModal variable
 * @module HelpModal
 */
function HelpModal({showHelpModal, setShowHelpModal}) { 
    const checkboxText = ['Show this automatically'];
    // the component used for this allows multiple checkboxes
    // so this part is an array of objects instead of simple true/false
    const [checkBoxIsSelected, setCheckBoxIsSelected] = useState([
        {
            "label" :"Show this automatically",
            "value" :"Show this automatically"
        }
    ]);

    const [showHelpText, setShowHelpText] = useState(true);
    const [hasConstructed, setHasConstructed] = useState(false);

    constructor = () => { 
        if (hasConstructed) { 
            return;
        } else { 
            storage.getShowCameraHelpMenu((val) => { 
                setShowHelpModal(val);
                if (!val) { 
                    setCheckBoxIsSelected([]);
                }
            });

            setHasConstructed(true);
        }
    }
    constructor();

    const clickCheckBox = (val) => {
        setCheckBoxIsSelected(val);

        if (val.length > 0) { 
            storage.setShowCameraHelpMenu(true);
        } else { 
            storage.setShowCameraHelpMenu(false);
        }
    }


    return (
        <Modal
            backdropOpacity={0.3}
            isVisible={showHelpModal}
            style={{
                margin: 0,
                marginHorizontal: 0,
                padding: 20,
                justifyContent: 'center',
            }}
            onBackdropPress={()=> {setShowHelpModal(false)}}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <View> 
                        {
                            showHelpText &&
                            <View style={styles.header}>
                                <TouchableOpacity
                                    onPress={() => { setShowHelpModal(false) }}
                                    style={styles.icon}
                                >
                                    <Ionicons
                                        name="close-circle-outline"
                                        color="black"
                                        size={26}
                                    ></Ionicons>
                                </TouchableOpacity>
                                <Button
                                    title="Do I need to hide my info?"
                                    onPress={() => { setShowHelpText(false) }}
                                ></Button>
                            </View>
                        }
                        {
                            !showHelpText &&
                            <View>
                                <TouchableOpacity
                                    onPress={() => { setShowHelpText(true) }}
                                    style={styles.icon}
                                >
                                    <Ionicons
                                        name="return-up-back-outline"
                                        color="black"
                                        size={26}
                                    ></Ionicons>
                                </TouchableOpacity>
                            </View>
                        }
                    </View>

                    {/* Body */}
                    {
                        !showHelpText &&
                        <View>
                            <Text style={styles.text}>You actually don't really need to hide your confidential information!</Text>
                            <Text style={styles.text}>We use Google Cloud Vision API's to detect the text from the image you choose,
                                    and match the words detected for cards in our database</Text>
                            <Text style={styles.text}>No information is saved.</Text>
                        </View>
                    }
                    {
                        showHelpText &&
                        <View>
                            <Text style={styles.text}>-Use the plus icon to add a box to hide confidential information</Text>
                            <Text style={styles.text}>-Move the boxes by holding and dragging the white box in the center</Text>
                            <Text style={styles.text}>-Resize the boxes by dragging any of the white boxes on the edge</Text>
                            <Text style={styles.text}>-The currently selected boxes are colored yellow, and unselected boxes are black</Text>
                            <Text style={styles.text}>-Select a box by tapping it</Text>
                            <Text style={styles.text}>-Delete the currently selected box by clicking the "X" icon</Text>
                        </View>
                    }

                    {/* Checkbox */}
                    <View>
                        <SelectMultiple
                            items={checkboxText}
                            selectedItems={checkBoxIsSelected}
                            onSelectionsChange={clickCheckBox} />
                    </View>
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    centeredView: {
        justifyContent: 'center',
        alignItems: 'stretch',
        backgroundColor: 'rgba(128, 128, 128, 0.5)'
    },
    modalView: {
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'stretch',
        borderRadius: 4,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    header: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    text: { 
        margin: 10
    },
    icon: { 
        marginTop: 8,
        marginLeft: 8
    },
});

export { HelpModal };