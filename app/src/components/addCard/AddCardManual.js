import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TextBox } from '../util/TextBox';
import { user } from '../../network/user';
import { cards } from '../../network/cards';
import { ManualRewardRow } from './ManualRewardRow';
import mainStyles from '../../styles/mainStyles';
import { Ionicons } from '@expo/vector-icons';

export function AddCardManual({navigation}) { 
    const inputName = React.createRef();
    const inputUrl = React.createRef();
    const inputReward = React.createRef();
    const [rewards, setRewards] = useState([]);
    const [displayRewards, setDisplayRewards] = useState(false);
    const [displayErrorText, setDisplayErrorText] = useState(false);

    resetRewardInputs = () => { 
        inputReward.current.state.value = "";
    }

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
   
            resetRewardInputs();
    
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

        cards.addCardToDatabase(name, null, rewards, url).then((cardId) => {
            console.log("new card id: " + cardId);
            user.saveCardToUser(userId, cardId, null, null);
            navigation.navigate('YourCards');
        });
    } 

    return (
        <View style={styles.container}>
            <Text style={mainStyles.title}>Add a Card Manually</Text>

            <Text style={styles.inputTitle}>Credit Card Name</Text>
            <TextBox style={styles.inputBox}ref={inputName} placeholder={'your credit card title here '} />

            <Text style={styles.inputTitle}>Rewards</Text>    
            <View style={styles.rewardContainer}>
                {
                    displayRewards &&
                    <View style={styles.rewardText}>
                        {
                        rewards.map((reward, i) => {
                            return <Text style={{ margin: 5 }} key={i}>Reward: {reward.type}, {reward.value} cents</Text>
                        })
                        }
                    </View>
                }
                {
                    displayErrorText &&
                    <Text style={{ color: 'red' }}>Please input a number</Text>
                }
                <View style={styles.rewardRow}>
                    <ManualRewardRow ref={inputReward}></ManualRewardRow>
                    <TouchableOpacity style={styles.plusIcon} onPress={addReward}>
                        <Ionicons
                            name="add-outline"
                            color="black"
                            size={32}
                        ></Ionicons>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Note: this needs zIndex to a negative value so dropdown will appear over it */}
            <View style={styles.bottomContainer}>
                <Text style={styles.inputTitle}>URL</Text>
                <TextBox style={styles.inputBox} ref={inputUrl} placeholder={'url'} />

                <View style={styles.addCardContainer}>
                    <TouchableOpacity style={styles.addCardButton} onPress={addCard}>
                        <Text style={styles.addCardText}>Add this card</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container : {
        backgroundColor: 'white',
        height: '100%'
    },
    rewardContainer: { 
        display: 'flex',
        flexDirection: 'column',
    },
    rewardRow : {
        display: 'flex',
        flexDirection: 'row'
    },
    rewardText : { 
        margin: 15,
        width: '90%',
        backgroundColor: '#F0F0F0',
        borderRadius: 5,
        marginTop: 8,
        marginBottom: 8, 
        justifyContent: 'center'
    },
    inputBox : {
        margin: 15,
        height: 40,
        width: '90%',
        borderColor: '#F0F0F0',
        borderWidth: 1,
        backgroundColor: '#F0F0F0',
        borderRadius: 5,
        marginTop: 8,
        marginBottom: 8
    },
    inputTitle : { 
        margin: 15,
        marginBottom: 5,
        fontSize: 18
    },
    plusIcon : {
        margin: 9,
        right: 32
    }, 
    addCardButton : {
        textAlign: 'center',
        backgroundColor: '#87CEFA',
        margin: 15,
        height: 40, 
        borderRadius: 5,
        width: '40%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomContainer : {
        zIndex: -1,
    },
    addCardContainer: {
        alignItems: 'center',
    }, 
    addCardText : { 
        color: 'white'
    }
});