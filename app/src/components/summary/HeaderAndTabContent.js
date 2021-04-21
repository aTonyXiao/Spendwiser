import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function HeaderAndTabContent(
    {
        modalType,
        curCard,
        curTimeframe,
        mode,
        curCategory,
        setModalVisible,
    }) {
    return (
        <View style={{flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', width: '100%'}}>
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: 10}}>
                <Ionicons
                    name="ellipsis-horizontal-circle"
                    color={'white'}
                    size={30}
                ></Ionicons>
                <Text style={styles.header}>Spendings & Transactions</Text>
                <Ionicons
                    name="ellipsis-horizontal-circle"
                    color={'black'}
                    size={30}
                    onPress={()=> {
                        setModalVisible(modalType.CARDS);
                    }}
                ></Ionicons>
            </View>
             <Text>{curCard === null ? "All Cards" : curCard["cardName"]}</Text>
        <View style={styles.tabContainer}>
            <View style={styles.tab}>
                <View style={{flex: 1, alignItems: 'center'}}><Text>Time period</Text></View>
                <View style={{flex: 1, alignItems: 'center'}}><Text>Mode</Text></View>
                <View style={{flex: 1, alignItems: 'center'}}><Text>Category</Text></View>
            </View>
            <View style={styles.tab}>
                <View style={{flex: 1, flexDirection:'row', alignItems: 'flex-end', justifyContent: 'center'}}>
                    <Text 
                        style={{color: 'blue'}}
                        onPress={() => {setModalVisible(modalType.TIME)}}
                    >{curTimeframe}</Text>
                    <Ionicons
                        name="chevron-down"
                        color="blue"
                        size={15}
                    ></Ionicons>
                </View>
                <View style={{flex: 1, flexDirection:'row', alignItems: 'flex-end', justifyContent: 'center'}}>

                    <Text 
                        style={{color: 'blue'}}
                        onPress={() => {setModalVisible(modalType.MODE)}}
                    >{mode}</Text>
                    <Ionicons
                        name="chevron-down"
                        color="blue"
                        size={15}
                    ></Ionicons>
                </View>
                <View style={{flex: 1,flexDirection:'row', alignItems: 'flex-end', justifyContent: 'center'}}>
                    <Text 
                        style={{color: 'blue'}}
                        onPress={() => {setModalVisible(modalType.CATEGORY)}}
                    >{curCategory.label}</Text>
                    <Ionicons
                        name="chevron-down"
                        color="blue"
                        size={15}
                    ></Ionicons>
                </View>
            </View>
        </View>     
        </View>
          
    );
}

const styles = StyleSheet.create({
    header: {
        fontSize: 20,
    },
    tabContainer: {
        marginTop: 10,
        width: '100%',
        flexDirection: 'column',
        justifyContent: 'space-between',
        paddingBottom: 10,
        borderBottomWidth: 0.5,
    },
    tab: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
});