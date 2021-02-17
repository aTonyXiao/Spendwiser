import React from 'react';
import { Button, View, StyleSheet, Text } from 'react-native';
import { TextBox } from '../util/TextBox';
import { user } from '../../network/user';
import { cards } from '../../network/cards';
import DropDownPicker from 'react-native-dropdown-picker';
import { useState } from 'react';

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

export function AddCardManual({navigation}) { 
    const inputName = React.createRef();
    const inputUrl = React.createRef();
    const inputReward = React.createRef();
    const [reward, setReward] = useState('cashback');
    // TODO need to be able to handle multiple rewards

    addCard = () => { 
        var userId = user.getUserId();

        var name = inputName.current.state.text;
        var url = inputUrl.current.state.text;
        var rewards = [];
        rewards.push({
            rewardType: reward, 
            rewardValue: inputReward.current.state.text
        });

        cards.addCard(name, rewards, url).then((cardId)=>{
            user.saveCardToUser(userId, cardId, 0, null);
            navigation.navigate('Cards');
        });
    } 

    return (
        <View>
            <Text>Credit Card Name</Text>
            <TextBox ref={inputName} placeholder={'your credit card title here '} />

            <Text>Rewards</Text>
            <View style={styles.rewardContainer}>
                <DropDownPicker
                    items={[
                        { label: 'cashback', value: '1', selected: true },
                        { label: 'airplane miles', value: '2' },
                    ]}
                    placeholder={"Select an item"}
                    onChangeItem={item => setReward(item)}
                    containerStyle={styles.dropdown}
                    style={{ backgroundColor:'#fafafa'}}
                    itemStyle={{
                        justifyContent: 'flex-start'
                    }}
                    dropDownStyle={{ backgroundColor: '#fafafa' }}
                />
                <TextBox style={styles.rewardInput} ref={inputReward} placeholder={'input rewards here'}/>
            </View>

            <Text>URL</Text>
            <TextBox ref={inputUrl} placeholder={'url'} />
            <Button
                title='Add this card'
                onPress={addCard}
            />
        </View>
    );
}