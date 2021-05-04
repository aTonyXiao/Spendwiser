import React from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import { View, StyleSheet, TextInput } from 'react-native';

export class ManualRewardRow extends React.Component {
    constructor(props) { 
        super(props);
        this.state = {
            reward : 'dining', 
            value : ""
        }
    }

    render() {
        return (
            <View style={styles.rewardContainer}>
                <DropDownPicker
                    items={[
                        { label: 'Dining', value: 'dining', selected: true },
                        { label: 'Grocery', value: 'grocery' },
                        { label: 'Drugstore', value: 'drugstore' },
                        { label: 'Gas', value: 'gas' },
                        { label: 'Home Improvement', value: 'homeImprovement' },
                        { label: 'Travel', value: 'travel' },
                        { label: 'Others or All', value: 'others' },
                    ]}
                    placeholder={"Select an item"}
                    onChangeItem={item => this.setState({reward: item.value})}
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
                    value={this.value}
                    keyboardType={"numeric"}
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