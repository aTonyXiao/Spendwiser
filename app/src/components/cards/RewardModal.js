import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { Ionicons } from '@expo/vector-icons';

// TODO: Not for use in alpha version!
// export function RewardModal = React.forwardRef((props, ref) => { 
//     const [modalVisible, setModalVisible] = useState(false);

//     return (
//         <Modal
//             transparent={true}
//             backdropOpacity={0.3}
//             visible={this.state.modalVisible}
//         >
//             <View style={styles.modalCenteredView}>
//                 <View style={styles.modalView}>
//                     <View style={styles.modalHeader}>
//                         <TouchableOpacity onPress={() => this.state.modalVisible = false}>
//                             <Ionicons
//                                 name="close-circle-outline"
//                                 color="black"
//                                 size={26}
//                             ></Ionicons>
//                         </TouchableOpacity>
//                         <Text style={styles.modalText}>How much did you spend?</Text>
//                         <View style={styles.rewardContainer}>
//                             <DropDownPicker
//                                 items={[
//                                     { label: 'cashback', value: '1', selected: true },
//                                     { label: 'travel', value: '2' },
//                                     { label: 'gas', value: '3' },
//                                     { label: 'grocery', value: '4' },
//                                     { label: 'restaurant', value: '5' },
//                                     { label: 'other not listed above', value: '6' },
//                                 ]}
//                                 placeholder={"Select an item"}
//                                 onChangeItem={item => this.setState({ reward: item.label })}
//                                 containerStyle={styles.dropdown}
//                                 style={{ backgroundColor: '#fafafa' }}
//                                 itemStyle={{ justifyContent: 'flex-start' }}
//                                 dropDownStyle={{ backgroundColor: '#fafafa' }}
//                             />
//                             <TextInput
//                                 style={styles.rewardInput}
//                                 onChangeText={(text) => this.setState({ value: text })}
//                                 placeholder={'value in cents'}
//                             />
//                         </View>
//                     </View>
//                 </View>
//             </View>
//         </Modal>
//     )
// });

// const styles = StyleSheet.create({
//     modalCenteredView: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'stretch',
//         marginTop: 22,
//         padding: 22,
//         backgroundColor: 'rgba(128, 128, 128, 0.5)'
//     },
//     modalView: {
//         backgroundColor: 'white',
//         justifyContent: 'center',
//         alignItems: 'stretch',
//         borderRadius: 4,
//         borderColor: 'rgba(0, 0, 0, 0.1)',
//     },
//     modalHeader: { 
//         position: 'absolute',
//         top: 8, 
//         left: 8
//     },
//     modalText: {
//         marginTop: 10,
//         alignSelf: 'center',
//         fontSize: 16
//     },
//     storeText: {
//         alignSelf: 'center',
//         fontWeight: 'bold',
//         fontSize: 16,
//         marginBottom: 10
//     },
//     manualTextInput: {
//         height: 40,
//         borderWidth: 1,
//         margin: 15,
//         marginTop: 7,
//         marginBottom: 7,
//         width: '90%',
//         borderColor: '#F0F0F0',
//         backgroundColor: '#F0F0F0',
//         borderRadius: 5,
//     },
//     rewardContainer: { 
//         display: 'flex',
//         flexDirection: 'row', 
//         minHeight: 10
//     }
// });