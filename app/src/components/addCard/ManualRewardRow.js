import { useEffect, useState } from 'react';
import React from 'react';
import { TextBox } from '../util/TextBox';
import DropDownPicker from 'react-native-dropdown-picker';
import { Button, View, StyleSheet, TextInput } from 'react-native';

const styles = StyleSheet.create({
    dropdown: {
        height: 40, 
        width: '40%',
        margin: 5, 
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
        flexDirection: 'row', 
        minHeight: 10
    }
});
const grayRGB = 'rgb(211, 211, 211)';

export class ManualRewardRow extends React.Component {
    constructor(props) { 
        super(props);

        this.state = {
            reward : 'cashback', 
            value : ""
        }
    }

    render() {
        return (
            <View style={styles.rewardContainer}>
                <DropDownPicker
                    items={[
                        { label: 'cashback', value: '1', selected: true },
                        { label: 'travel', value: '2' },
                        { label: 'gas', value: '3' },
                        { label: 'grocery', value: '4' },
                        { label: 'restaurant', value: '5' },
                        { label: 'other not listed above', value: '6' },
                    ]}
                    placeholder={"Select an item"}
                    onChangeItem={item => this.setState({reward: item.label})}
                    containerStyle={styles.dropdown}
                    style={{ backgroundColor: '#fafafa' }}
                    itemStyle={{justifyContent: 'flex-start'}}
                    dropDownStyle={{ backgroundColor: '#fafafa' }}
                />
                <TextInput
                    style={styles.rewardInput}
                    onChangeText={(text) => this.setState({value: text})}
                    placeholder={'input reward value here'}
                    placeholderTextColor={grayRGB}
                />
            </View>
        )
    }
}