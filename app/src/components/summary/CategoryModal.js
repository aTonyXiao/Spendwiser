import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Dimensions, ScrollView } from 'react-native';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';
import { ModalSlot } from './ModalSlot';
import { summaryHelper } from './SummaryHelper';

export function CategoryModal(
    {
        modalType,
        modalVisible,
        setModalVisible,
        curTimeframe,
        setCurTimeframe,
        curCategory,
        changeCategory,
        values,
        transactions,
        cards,
        curCard,
        setCurCardFromModal,
        modeType,
        mode,
        setMode,
        categoriesLimit,
        changeCategoriesLimit,
    }) {
    const timeframe = ['This month', 'Last month', 'Last 3 months'];
    const categories = ['All categories', 'Dining', 'Grocery', 'Drugstore', 'Gas', 'Home', 'Travel', 'Others'];
    const modes = [modeType.SUMMARY, modeType.COMPARE, modeType.BUDGET];
    const [tmpCatLimits, setTmpCatLimits] = useState([]);
    const deviceHeight =
    Platform.OS === 'ios'
    ? Dimensions.get('window').height
    : Dimensions.get('screen').height;

    useEffect(() => {
        setTmpCatLimits([...categoriesLimit]);
    }, [categoriesLimit]);

    return (
        <Modal
            backdropOpacity={0.3}
            onBackdropPress={() => setModalVisible(modalType.DISABLED)}
            statusBarTranslucent={true}
            deviceHeight={deviceHeight}
            style={{
                margin: 0,
                marginHorizontal: 0,
                justifyContent: 'flex-end',
            }}
            isVisible={modalVisible !== modalType.DISABLED}
            avoidKeyboard={true}
        >
            <View style={modalStyles.modalBottomView}>
                <View style={modalStyles.modalView}>
                    {/* Modal header */}
                    <View style={modalStyles.modalHeader}>
                        <TouchableOpacity style={{flex: 1}} onPress={() => {setModalVisible(modalType.DISABLED)}}>
                            <Ionicons
                                name="close-circle-outline"
                                color="black"
                                size={26}
                            ></Ionicons>
                        </TouchableOpacity>
                        <View style = {{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                            {modalVisible === modalType.TIME ? <Text>Time period</Text> : 
                            modalVisible === modalType.CATEGORY ? <Text>Category</Text> : 
                            modalVisible === modalType.TRANSACTIONS ? <Text>Transactions</Text> :
                            modalVisible === modalType.CARDS ? <Text>Cards</Text> :
                            modalVisible === modalType.MODE ? <Text>Mode</Text> : <Text>Category Limits</Text>}
                            
                        </View>
                        <View style= {{flex: 1}}></View>
                    </View>

                    {/* Modal body */}
                    {/* Change timeframe */}
                    {
                        modalVisible === modalType.TIME &&
                        <View style={{marginBottom: 50}}>
                            {
                                timeframe.map((frame) => { 
                                    return (
                                        <ModalSlot
                                        key={frame}
                                        textString={frame}
                                        selected={curTimeframe === frame}
                                        setSelected={setCurTimeframe}
                                        setModalVisible={setModalVisible}
                                        isValid = {true}
                                        amountSpent ={null}
                                        />
                                    )
                                })
                            }
                        </View>
                    }
                    {/* Change category */}
                    {
                        modalVisible === modalType.CATEGORY &&
                        <View style={{marginBottom: 50}}>
                            {
                                categories.map((cat, index) => { 
                                    return (
                                        <ModalSlot
                                            key={cat}
                                            textString={cat}
                                            selected={curCategory.label === cat}
                                            setSelected={changeCategory}
                                            setModalVisible={setModalVisible}
                                            isValid={index === 0 || values[index - 1] !== 0 ? true : false}
                                            amountSpent ={null}
                                        />
                                    )
                                })
                            }
                        </View>
                    }
                    {/* Display transactions */}
                    {
                        modalVisible === modalType.TRANSACTIONS &&
                        <ScrollView style={{marginBottom: 50}}>
                            {
                                transactions.map((transaction, index) => {
                                    let curCatIdx = categories.indexOf(curCategory.label);
                                    if (curCategory.label === 'All categories' || 
                                        summaryHelper.matchTransactionToCategory(transaction) === curCatIdx - 1) {
                                            return (
                                                <ModalSlot
                                                    key={index}
                                                    textString={transaction['storeInfo']['storeName']
                                                        + "\n" + transaction['dateAdded'].toDateString()}
                                                    selected={null}
                                                    setSelected={null}
                                                    setModalVisible={setModalVisible}
                                                    isValid={false}
                                                    amountSpent={parseFloat(transaction['amountSpent']).toFixed(2)}
                                                />
                                            )
                                        }
                                       
                                })
                            }
                        </ScrollView>
                    }
                    {/* Display card menu */}
                    {
                        modalVisible === modalType.CARDS &&
                        <View style={{marginBottom: 50}}>
                            <ModalSlot
                                key={"All Cards"}
                                textString={"All Cards"}
                                selected={curCard === null}
                                setSelected={setCurCardFromModal}
                                setModalVisible={setModalVisible}
                                isValid={true}
                                amountSpent ={null}
                            />
                            {
                                cards.map((card, index) => {
                                    return (
                                        <ModalSlot
                                            key={card["cardName"]}
                                            textString={card["cardName"]}
                                            selected={curCard !== null && curCard["cardId"] === card["cardId"]}
                                            setSelected={setCurCardFromModal}
                                            setModalVisible={setModalVisible}
                                            isValid={true}
                                            amountSpent ={null}
                                        />
                                    )
                                })
                            }
                        </View>
                    }
                    {/* Change Mode */}
                    {
                        modalVisible === modalType.MODE &&
                        <View style={{marginBottom: 50}}>
                            {modes.map((tmpMode, index) => { 
                                return (
                                    <ModalSlot
                                        key={tmpMode}
                                        textString={tmpMode}
                                        selected={mode === tmpMode}
                                        setSelected={setMode}
                                        setModalVisible={setModalVisible}
                                        isValid={true}
                                        amountSpent ={null}
                                    />
                                )
                            })}
                        </View>
                    }
                     {/* View and change category limits */}
                     {
                        modalVisible === modalType.LIMITS &&
                        <View style={{marginBottom: 50}}>
                            {tmpCatLimits.map((catLimit, index) => { 
                                console.log(catLimit);
                                return (
                                    <TouchableOpacity 
                                        key={index}
                                        style={modalStyles.slot}
                                        onPress={() => {}}
                                    >
                                        <Text>{categories[index + 1]}</Text>
                                        <TextInput 
                                            style={modalStyles.input}
                                            value={catLimit.toString()}
                                            onChangeText={(val) => {
                                                let valDouble = parseFloat(val);
                                                if (val.length === 0)
                                                    valDouble = 0;
                                                let newTmpCatLimits = [...tmpCatLimits];
                                                newTmpCatLimits[index] = valDouble;
                                                setTmpCatLimits(newTmpCatLimits);
                                            }}
                                            placeholder={catLimit.toString()}
                                            keyboardType="numeric"
                                        />
                                    </TouchableOpacity>
                                )
                            })}
                            {
                            <TouchableOpacity 
                                style={{...modalStyles.slot, justifyContent: 'center'}}
                                onPress={() => {changeCategoriesLimit(tmpCatLimits), setModalVisible(modalType.DISABLED)}}
                            >
                                <Text style={{color:'green', fontSize:16, fontWeight:'bold'}}>Save</Text>
                            </TouchableOpacity>
                            }
                        </View>
                    }
                </View>
            </View>
        </Modal>
    )
    
};

const modalStyles = StyleSheet.create({
    modalBottomView: {
        margin: 0,
        justifyContent: 'flex-end',
        alignItems: 'stretch',
        backgroundColor: 'rgba(128, 128, 128, 0.5)',
        maxHeight: "60%",
    },
    modalView: {
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'stretch',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
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
    slot: {
        width: '100%',
        height: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 0.5
    },
    input: {
        height: 30,
        textAlign: 'center',
        borderWidth: 0.5,
        paddingHorizontal: 20,
    },
});