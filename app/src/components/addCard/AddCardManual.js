import React, { useEffect, useState } from 'react';
import { Button, View, Text, StyleSheet } from 'react-native';
import { TextBox } from '../util/TextBox';
import { user } from '../../network/user';
import { cards } from '../../network/cards';
import { ManualRewardRow } from './ManualRewardRow';

const styles = StyleSheet.create({
    rewardContainer: { 
        display: 'flex',
        flexDirection: 'row'
    }, 
    rewardRows: {
        // display: 'flex', 
        // flexDirection: 'column'
    }
});

export function AddCardManual({navigation}) { 
    const inputName = React.createRef();
    const inputUrl = React.createRef();
    const inputReward = React.createRef();
    const [rewards, setRewards] = useState([]);
    const [displayRewards, setDisplayRewards] = useState(false);
    const [displayErrorText, setDisplayErrorText] = useState(false);

    addReward = () => { 
        const rewardType = inputReward.current.state.reward;
        const rewardValue = inputReward.current.state.value;

        if (!isNaN(parseFloat(rewardValue))) { 
            setRewards([
                ...rewards,
                {
                    type : rewardType,
                    value : rewardValue,
                }
            ])
    
            // TODO reset input boxes
    
            setDisplayRewards(true);
        } else { 
            setDisplayErrorText(true);

            setTimeout(function() { 
                setDisplayErrorText(false);
            }, 2000);
        }
    }

    addCard = () => { 
        console.log("adding a manual card")
        var userId = user.getUserId();

        var name = inputName.current.state.text;
        var url = inputUrl.current.state.text;
        var categoryRewards = rewards 

        cards.addCard(name, rewards, url).then((cardId) => {
            console.log("new card id: " + cardId);
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
                <View style={styles.rewardRows}>
                    {
                        displayRewards && 
                        rewards.map((reward, i) => {
                            return <Text key={i}>Reward: {reward.type}, {reward.value} cents</Text>
                        })
                    }
                    {
                        displayErrorText && 
                        <Text style={{color:'red'}}>Please input a number</Text>
                    }
                    <ManualRewardRow ref={inputReward}></ManualRewardRow>
                </View>
                <Button
                    title='+'
                    onPress={addReward}
                ></Button>
            </View>

            {/* Note: this needs zIndex to a negative value so dropdown will appear over it */}
            <View style={{zIndex: -1}}>
                <Text>URL</Text>
                <TextBox ref={inputUrl} placeholder={'url'} />
                <Button
                    title='Add this card'
                    onPress={addCard}
                />
            </View>
        </View>
    );
}