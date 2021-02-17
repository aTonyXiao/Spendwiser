import React from 'react';
import { Button, View, Text } from 'react-native';
import { TextBox } from '../util/TextBox';
import { user } from '../../network/user';
import { cards } from '../../network/cards';
import { useState } from 'react';
import { ManualRewardRow } from './ManualRewardRow';

export function AddCardManual({navigation}) { 
    const inputName = React.createRef();
    const inputUrl = React.createRef();
    const [rewards, setRewards] = useState([]);
    // TODO need to be able to handle multiple rewards

    addCard = () => { 
        var userId = user.getUserId();

        var name = inputName.current.state.text;
        var url = inputUrl.current.state.text;

        cards.addCard(name, rewards, url).then((cardId)=>{
            user.saveCardToUser(userId, cardId, 0, null);
            navigation.navigate('Cards');
        });
    } 

    addReward = (i, reward) => {
        rewards[i] = reward;
        console.log(rewards);
    };

    return (
        <View>
            <Text>Credit Card Name</Text>
            <TextBox ref={inputName} placeholder={'your credit card title here '} />

            <Text>Rewards</Text>
            <ManualRewardRow addReward={addReward} i={0}></ManualRewardRow>

            <Text>URL</Text>
            <TextBox ref={inputUrl} placeholder={'url'} />
            <Button
                title='Add this card'
                onPress={addCard}
            />
        </View>
    );
}