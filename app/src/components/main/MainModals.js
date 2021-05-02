import React, { useState} from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity, Modal } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import RNPickerSelect, { defaultStyles } from 'react-native-picker-select';
import { Ionicons } from '@expo/vector-icons';

export function MainModals(
    {
        modalVisible,
        setModalVisible,
        reloadRecCard,
        addManualInput,
        storeArr,
        curStore,
        region,
    }) {

    const [manualInput, setManualInput] = useState({storeName: "", vicinity: "", storeType: "dining"});
    const [manualModal, setManualModal] = useState(false);
    const categories = [
        {
            label: 'Dining',
            value: 'dining',
        },
        {
            label: 'Drugstore',
            value: 'drugstore',
        },
        {
            label: 'Gas',
            value: 'gas',
        },
        {
            label: 'Grocery',
            value: 'grocery',
        },
        {
            label: 'Home Improvement',
            value: 'homeImprovement',
        },
        {
            label: 'Others',
            value: 'others',
        },
        {
            label: 'Travel',
            value: 'travel',
        },
    ];
    const placeholder = {
        label: "Category (Required)",
        value: "",
        color: '#9EA0A4',
      };
    return (
        <Modal
                animationType="slide"
                transparent={true}
                backdropOpacity={0.3}
                statusBarTranslucent={true}
                visible={modalVisible}
            >
                <View style={modalStyles.modalCenteredView}>
                    <View style={modalStyles.modalView}>

                        {/* Modal header */}
                        <View style={modalStyles.modalHeader}>
                            <TouchableOpacity onPress={() => {setModalVisible(false); setManualModal(false)}}>
                                <Ionicons
                                    name="close-circle-outline"
                                    color="black"
                                    size={26}
                                ></Ionicons>
                            </TouchableOpacity>
                            {
                                !manualModal &&
                                <TouchableOpacity onPress={() => setManualModal(true)}>
                                    <Text style={modalStyles.manualModalSwitchText}>Don't see your store?</Text>
                                </TouchableOpacity>
                            }
                            {
                                manualModal &&
                                <TouchableOpacity onPress={() => setManualModal(false)}>
                                    <Text style={modalStyles.manualModalSwitchText}>Select from store list</Text>
                                </TouchableOpacity>
                            }
                        </View>

                        {/* Modal body */}
                        {/* Pick from store list */}
                        {
                            !manualModal &&
                            <View>
                                {
                                    storeArr.map((store, i) => { 
                                        var storeName = store.value;
                                        var storeIsSelected = (storeName == curStore);
                                        return (
                                            <TouchableOpacity 
                                                key={i}
                                                onPress={()=> {
                                                    reloadRecCard(storeName, i, storeArr[i].storeType);
                                                    setModalVisible(false);
                                                }}
                                            >
                                                <Text style={storeIsSelected ? modalStyles.storeTextSelected : modalStyles.storeText}>
                                                        {storeName}
                                                </Text>
                                            </TouchableOpacity>
                                        )
                                    })
                                }
                            </View>
                        }

                        {/* Manual store input */}
                        {
                            manualModal &&
                            <View>
                                <Text style={modalStyles.manualTitle}>Input the store near you</Text>
                                <TextInput
                                    style={modalStyles.manualTextInput}
                                    onChangeText={text => {
                                        setManualInput((prevState) => {
                                            return { ...prevState, storeName: text };
                                        })
                                    }}
                                    value={manualInput.storeName}
                                    placeholder={"Store Name (Optional)"}
                                />
                                <TextInput
                                    style={modalStyles.manualTextInput}
                                    onChangeText={text => {
                                        setManualInput((prevState) => {
                                            return { ...prevState, vicinity: text };
                                        })
                                    }}
                                    value={manualInput.vicinity}
                                    placeholder={"Address (Optional)"}
                                />
                                <View style={modalStyles.picker}>
                                    <RNPickerSelect
                                        placeholder={placeholder}
                                        items={categories}
                                        onValueChange={value => {
                                            setManualInput((prevState) => {
                                                return { ...prevState, storeType: value };
                                            });
                                        }}
                                        style={{
                                        ...pickerSelectStyles,
                                        iconContainer: {
                                            top: 10,
                                            right: 12,
                                        },
                                        }}
                                        value={manualInput.storeType}
                                        useNativeAndroidPickerStyle={false}
                                        textInputProps={{ underlineColor: 'yellow' }}
                                        Icon={() => {
                                        return <Ionicons name="md-arrow-down" size={24} color="gray" />;
                                        }}
                                    />
                                </View>
                                {
                                    (manualInput.storeType.length != 0) &&
                                    <Button
                                        onPress={() => {
                                            setModalVisible(!modalVisible);
                                            setManualModal(false);
                                            if (manualInput.storeType.length != 0) {
                                                let storeArrLen = (storeArr.length).toString();
                                                let manualInputObj = {
                                                    label: manualInput.storeName.length === 0 ? "Manual Input " + storeArrLen : manualInput.storeName,
                                                    value: manualInput.storeName.length === 0 ? "Manual Input " + storeArrLen : manualInput.storeName,
                                                    vicinity: manualInput.vicinity.length === 0 ? "N/A" : manualInput.vicinity,
                                                    storeType: manualInput.storeType,
                                                    geometry: [region.latitude, region.longitude],
                                                    key: Object.keys(storeArr).length,
                                                }
                                                addManualInput(manualInputObj);
                                            }
                                        }}
                                        title="Set"
                                        style={{ margin: 10 }}
                                    ></Button>
                                }
                                {
                                    (manualInput.storeType.length == 0) &&
                                    <Text style={modalStyles.setButtonNotAllowed}>Set</Text>
                                }
                            </View>
                        }
                    </View>
                </View>
            </Modal>
    );
}

const modalStyles = StyleSheet.create({
    modalCenteredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'stretch',
        marginTop: 22,
        padding: 22,
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
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between', 
        margin: 8
    },
    manualTitle: { 
        textAlign: 'center',
        fontSize: 18,
        marginBottom: 4
    },
    manualTextInput: {
        height: 40,
        borderWidth: 1,
        margin: 15,
        marginTop: 7,
        marginBottom: 7,
        width: '90%',
        borderColor: '#F0F0F0',
        backgroundColor: '#F0F0F0',
        borderRadius: 5,
    },
    picker: {
        height: 40,
        borderWidth: 1,
        margin: 15,
        marginTop: 7,
        marginBottom: 7,
        width: '90%',
        borderRadius: 5,
        borderColor: '#F0F0F0',
        backgroundColor: '#F0F0F0',
    },
    manualModalSwitchText: {
        color: 'dodgerblue'
    }, 
    storeText: { 
        padding: 5,
        marginLeft: 10 
    },
    storeTextSelected: { 
        padding: 15,
        backgroundColor: '#28b573'
    },
    setButtonNotAllowed: { 
        color: 'gray',
        fontSize: 20,
        alignSelf: 'center',
        margin: 10
    },
});

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
      fontSize: 16,
      paddingVertical: 12,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderColor: '#F0F0F0',
      borderRadius: 4,
      color: 'black',
      paddingRight: 30, // to ensure the text is never behind the icon
    },
    inputAndroid: {
      fontSize: 16,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderWidth: 0.5,
      borderColor: '#F0F0F0',
      borderRadius: 8,
      color: 'black',
      paddingRight: 30, // to ensure the text is never behind the icon
    },
  });