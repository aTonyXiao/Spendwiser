import { useEffect, useState } from 'react';
import React from 'react';
import { TextBox } from '../util/TextBox';
import DropDownPicker from 'react-native-dropdown-picker';
import { Button, View, StyleSheet, Text } from 'react-native';

const styles = StyleSheet.create({
    dropdown: {
        height: 40, 
        width: '40%',
        margin: 5
    }, 
    rewardInput: { 
        height: 40, 
        width: '40%',
        margin: 5,
        borderColor: 'gray',
        borderWidth: 1
    },
    rewardContainer: { 
        display: 'flex',
        flexDirection: 'row'
    }
});

export function ManualRewardRow(props) {
    const inputReward = React.createRef();
    const [reward, setReward] = useState('cashback');
    const index = props.i;
    const addReward = props.addReward;

    addReward(index, {reward: reward, value: inputReward.current.state.value});

    return (
        <View style={styles.rewardContainer}>
            <DropDownPicker
                items={[
                    { label: 'cashback', value: '1', selected: true },
                    { label: 'airplane miles', value: '2' },
                ]}
                placeholder={"Select an item"}
                onChangeItem={item => callParent()}
                containerStyle={styles.dropdown}
                style={{ backgroundColor: '#fafafa' }}
                itemStyle={{justifyContent: 'flex-start'}}
                dropDownStyle={{ backgroundColor: '#fafafa' }}
            />
            <TextBox style={styles.rewardInput} ref={inputReward} placeholder={'input rewards here'} />
        </View>
    )
}