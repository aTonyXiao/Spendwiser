import React from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import { View, StyleSheet, TextInput } from 'react-native';

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
                    placeholder={'value in cents'}
                    placeholderTextColor={grayRGB}
                />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    dropdown: {
        height: 40, 
        width: '40%',
        margin: 8,
        marginLeft: 15,
        // backgroundColor: '#F0F0F0'
    }, 
    rewardInput: { 
        height: 40, 
        width: '40%',
        margin: 5,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        backgroundColor: '#F0F0F0',
        borderRadius: 5,
        marginTop: 8,
        marginBottom: 8
    },
    rewardContainer: { 
        display: 'flex',
        flexDirection: 'row', 
        minHeight: 10
    }
});
const grayRGB = 'rgb(211, 211, 211)'