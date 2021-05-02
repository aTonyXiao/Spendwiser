import React from 'react';
import { 
    StyleSheet, 
    View, 
    Text, 
    TouchableOpacity, 
    Alert 
} from 'react-native';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';
import { appBackend } from '../../network/backend'

function AddCardModal({navigation, modalVisible, setModalVisible}) {
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
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <Ionicons
                                name="close-circle-outline"
                                color="black"
                                size={26}
                            ></Ionicons>
                        </TouchableOpacity>
                    </View>

                    <View style={modalStyles.modalBody}>
                        <Text style={modalStyles.modalTitle}>Add New Card</Text>
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
        backgroundColor: 'rgba(128, 128, 128, 0.5)'
    },
    modalView: {
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'stretch',
        borderRadius: 4,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    modalHeader: {
        margin: 8
    },
    modalBody: {
        alignItems: 'center'
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
        margin: 10,
        marginTop: -26
    },
});

export { AddCardModal };