import React from 'react';
import { 
    Text, 
    View, 
    StyleSheet, 
    TouchableOpacity, 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function CameraSettingsBar({navigation, moveableBlocks, setMoveableBlocks, setShowSettingsBar, setSendToApi}) {
    const chooseDifferentImage = () => {
        navigation.navigate('ChooseImage');
    } 

    // TODO: need to add some code for checking if no box is currently selected, OR
    //  only show this option when a box is selected
    const deleteBox = () => {
        // let newBlocks = moveableBlocks;
        // newBlocks.pop();
        // setMoveableBlocks(newBlocks);
    }

    const addBlock = () => {
        let newBlocks = moveableBlocks;
        for (let j=0 ; j<newBlocks.length; j++) { 
            newBlocks[j] = false;
        }
        newBlocks.push(true);
        setMoveableBlocks(newBlocks)
    }

    const showHelp = () => { 

    }

    const callDone = () => { 
        setShowSettingsBar(false);
        setSendToApi(true);
    }

    return(
        <View style={styles.container}>
            <TouchableOpacity onPress={chooseDifferentImage}>
                <Text style={styles.txt}>Choose different image</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={deleteBox}>
                <Text style={styles.txt}>Delete Box</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={addBlock}>
                <Text style={styles.txt}>Add Another Box</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={showHelp}>
                    <Ionicons
                        name="help-circle-outline"
                        color="black"
                        size={32}
                    ></Ionicons>
                </TouchableOpacity>
            <TouchableOpacity onPress={callDone}>
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