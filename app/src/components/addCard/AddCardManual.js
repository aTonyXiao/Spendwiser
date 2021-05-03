import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TextBox } from '../util/TextBox';
import { user } from '../../network/user';
import { cards } from '../../network/cards';
import { ManualRewardRow } from './ManualRewardRow';
import mainStyles from '../../styles/mainStyles';
import { Ionicons } from '@expo/vector-icons';
import { DismissKeyboard } from '../util/DismissKeyboard';
import DropDownPicker from 'react-native-dropdown-picker';

export function AddCardManual({navigation}) { 
    const inputName = React.createRef();
    const inputUrl = React.createRef();
    const inputReward = React.createRef();
    const [rewards, setRewards] = useState([]);
    const [displayRewards, setDisplayRewards] = useState(false);
    const [rewardType, setRewardType] = useState("Cashback");

    const [rewardError, setRewardError] = useState(false);
    const [invalidInputError, setInvalidInputError] = useState(false);
    const [nameError, setNameError] = useState(false);
    const [urlError, setUrlError] = useState(false);


    resetRewardInputs = () => { 
        inputReward.current.state.value = "";
    }

    addReward = () => { 
        const rewardType = inputReward.current.state.reward;
        const rewardValue = inputReward.current.state.value;

        if (!isNaN(parseFloat(rewardValue))) { 
            let index = rewards.findIndex(e => e.type === rewardType);
            if (index !== -1) {
                let tempRewards = [...rewards];
                tempRewards.splice(index, 1,
                {
                    type : rewardType,
                    value : rewardValue,
                });
                setRewards(tempRewards);
            } else {
                setRewards([
                    ...rewards,
                    {
                        type : rewardType,
                        value : rewardValue,
                    }
                ])
            }
   
            resetRewardInputs();
    
            setDisplayRewards(true);
        } else { 
            setRewardError(true);

            setTimeout(function() { 
                setRewardError(false);
            }, 2000);
        }
    }

    validateInputs = (name, url) => { 
        var inputsAreValid = true;

        if (name == "") { 
            inputsAreValid = false;
            setInvalidInputError(true);
            setNameError(true);
            setTimeout(function() { 
                setInvalidInputError(false);
                setNameError(false);
            }, 2500);
        } 

        // TODO: add some regex for beta version?
        if (url == "") {
            setUrlError(true);
            setTimeout(function() { 
                setUrlError(false);
            }, 2500);
        }

        if (rewards.length == 0) {
            inputsAreValid = false;
            setInvalidInputError(true);
            setTimeout(function() { 
                setInvalidInputError(false);
            }, 2500);
        }
        
        return inputsAreValid;
    }

    addCard = async () => { 
        var userId = user.getUserId();

        var name = inputName.current.state.text;
        var url = inputUrl.current.state.text;
        var inputsAreValid = validateInputs(name, url);
        if (inputsAreValid) { 
            // Convert reward array to map to store in firebase
            var rewardsMap = {};
            rewards.map(item => {rewardsMap[item.type] = parseFloat(item.value)})
            if (rewardsMap["others"] === undefined) {
                rewardsMap["others"] = 0;
            }
            console.log(rewardsMap);
            cards.addCardToDatabase(name, [], rewardType, rewardsMap, url).then(async (cardId) => {
                await user.saveCardToUser(userId, cardId, null, null);
                navigation.navigate('YourCards');
            });
        } 
    } 

    return (
        <DismissKeyboard>
            <View style={styles.container}>
                <Text style={mainStyles.title}>Add a Card Manually</Text>

                <Text style={styles.inputTitle}>Credit Card Name</Text>
                <TextBox
                    style={!nameError ? styles.inputBox : styles.inputBoxError}
                    ref={inputName}
                    placeholder={'Your credit card title here '}
                />
                <Text style={styles.inputTitle}>Card Type</Text>
                    <View>
                        <DropDownPicker
                            items={[
                                { label: 'Cashback', value: 'Cashback' },
                                { label: 'Points', value: 'Points' },
                                { label: 'Miles', value: 'Miles' },
                                { label: 'Unknown', value: 'Unknown' },
                            ]}
                            defaultValue={"Cashback"}
                            onChangeItem={item => setRewardType(item.value)}
                            containerStyle={{ height: 40, width: '40%', margin: 8, marginLeft: 15}}
                            style={{ backgroundColor: '#fafafa' }}
                            itemStyle={{justifyContent: 'flex-start'}}
                            dropDownStyle={{ backgroundColor: '#fafafa' }}
                        />
                    </View>
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
                        rewardError &&
                        <Text style={{ color: 'red', marginHorizontal: 15}}>Please input a number</Text>
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
                        {
                            (invalidInputError) &&
                            <Text style={{ color: 'red' }}>Please add a name and reward</Text>
                        }
                        <TouchableOpacity style={styles.addCardButton} onPress={addCard}>
                            <Text style={styles.addCardText}>Add this card</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </DismissKeyboard>
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
    inputBoxError : {
        margin: 15,
        height: 40,
        width: '90%',
        borderColor: 'red',
        borderWidth: 1,
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