import React from 'react';
import { 
    StyleSheet, 
    View, 
    Text, 
    TouchableOpacity, 
    Alert,
    Dimensions
} from 'react-native';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';
import { appBackend } from '../../network/backend'

function AddCardModal({navigation, modalVisible, setModalVisible}) {
    const deviceHeight =
        Platform.OS === 'ios'
        ? Dimensions.get('window').height
        : Dimensions.get('screen').height;

    function navigateIfAuthorized(navigation, location, errmsg) {
        appBackend.userAccountType((type) => {
            switch(type) {
            case 'offline':
                Alert.alert(
                    "Unable to use this feature",
                    errmsg,
                    [
                        { text: "OK", onPress: () => { setModalVisible(false) }}
                    ]
                );
                break;
            case 'normal':
                setModalVisible(false);
                navigation.navigate(location);
            }
        });
    }
    return (
        <Modal
            backdropOpacity={0.3}
            onBackdropPress={() => setModalVisible(false)}
            statusBarTranslucent={true}
            deviceHeight={deviceHeight}
            style={{
                margin: 0,
                marginHorizontal: 0,
                justifyContent: 'center',
                padding: 20,
            }}
            isVisible={modalVisible}
            avoidKeyboard={true}
        >
            <View style={modalStyles.modalCenteredView}>
                <View style={modalStyles.modalView}>
                    <View style={modalStyles.modalHeader}>
                        <TouchableOpacity style={{flex: 1}} onPress={() => setModalVisible(false)}>
                            <Ionicons
                                name="close-circle-outline"
                                color="black"
                                size={26}
                                style={{paddingLeft: 15, alignItems: 'center'}}
                            ></Ionicons>
                        </TouchableOpacity>
                        <Text style={modalStyles.modalTitle}>Add New Card</Text>
                        <View style={{flex: 1}}/>
                    </View>

                    <View style={modalStyles.modalBody}>
                        <TouchableOpacity
                            onPress={() => {
                                navigateIfAuthorized(navigation, 'AddCardDB', "Sign up with an account to use this feature");
                            }}
                            style={modalStyles.button}
                        >
                            <Text style={modalStyles.modalText}>By Search</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => {
                                setModalVisible(!modalVisible);
                                navigateIfAuthorized(navigation, 'ChooseImage', 'Sign up with an account to use this feature!');
                            }}
                            style={modalStyles.button}
                        >
                            <Text style={modalStyles.modalText}>By Camera</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => {
                                setModalVisible(!modalVisible);
                                navigation.navigate('AddCardManual');
                            }}
                            style={modalStyles.button}
                        >
                            <Text style={modalStyles.modalText}>Manually</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>

    )
}

const modalStyles = StyleSheet.create({
    modalCenteredView: {
        justifyContent: 'center',
        alignItems: 'stretch',
        backgroundColor: 'rgba(128, 128, 128, 0.5)',
        borderRadius: 50
    },
    modalView: {
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'stretch',
        borderRadius: 35,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    modalHeader: {
        marginTop: 16,
        flexDirection: 'row',
        
    },
    modalBody: {
        alignItems: 'center',
        marginBottom: 6
    },
    modalText: {
        color: 'black',
        margin: 5,
        padding: 5,
        fontSize: 16,
    },
    button: {
        textAlign: 'center',
        backgroundColor: '#28b573',
        margin: 10,
        height: 40, 
        borderRadius: 5,
        width: '40%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalTitle: {
        fontSize: 24,
        color: 'black',
        marginBottom: 10,
    },
});

export { AddCardModal };