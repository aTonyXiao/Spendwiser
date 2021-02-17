import React from 'react';
import { Button, View, Text } from 'react-native';
import { TextBox } from '../TextBox';
import { user } from '../../network/user';
import { cards } from '../../network/cards';
import DropDownPicker from 'react-native-dropdown-picker';
import { useState } from 'react';

export function AddCardManual({navigation}) { 
    const inputName = React.createRef();
    const inputUrl = React.createRef();
    const [reward, setReward] = useState('cashback');
    // TODO need to be able to handle multiple rewards

    addCard = () => { 
        var userId = user.getUserId();

        var name = inputName.current.state.text;
        var url = inputUrl.current.state.text;

        var rewards = [];

        cards.addCard(name, rewards, url).then((cardId)=>{
            user.saveCardToUser(userId, cardId, 0, null);
            navigation.navigate('Cards');
        });
    } 

    return (
        <View>
            <TextBox ref={inputName} placeholder={'your credit card title here '} />
            <Text>Below is a dropdown for reward type... needs some styling</Text>
            <DropDownPicker
                items={[
                    {label: 'cashback', value: '1', selected: true}, 
                    {label: 'airplane miles', value: '2'},
                ]}
                placeholder={"Select an item"}
                onChangeItem={item => setReward(item)}
            />
            <TextBox ref={inputUrl} placeholder={'url'} />
            <Button
                title='Add this card'
                onPress={addCard}
            />
        </View>
    );
}