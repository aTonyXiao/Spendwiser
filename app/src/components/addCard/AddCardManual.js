import React, { useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity,
    TextInput,
    SafeAreaView
} from 'react-native';
import { TextBox } from '../util/TextBox';
import { user } from '../../network/user';
import mainStyles from '../../styles/mainStyles';
import { DismissKeyboard } from '../util/DismissKeyboard';
import DropDownPicker from 'react-native-dropdown-picker';
import { cards } from '../../network/cards';
import { Ionicons } from '@expo/vector-icons';
import { BackButtonHeader } from '../util/BackButtonHeader';

/**
 * The page for adding a card manually. Adding a card adds the card to the user and to
 * firebase
 * @param {{Object}} obj - The route and navigation passed through screen
 * @param {Object} obj.navigation - navigation object used to move between different pages
 * @module AddCardManual
 */
export function AddCardManual({navigation}) { 
    const inputName = React.createRef();
    const inputUrl = React.createRef();
    const [rewards, setRewards] = useState([]);
    const [displayRewards, setDisplayRewards] = useState(false);
    const [rewardType, setRewardType] = useState("Cashback");

    const [rewardError, setRewardError] = useState(false);
    const [invalidInputError, setInvalidInputError] = useState(false);
    const [nameError, setNameError] = useState(false);

    const [rewardValue, setRewardValue] = useState("");
    const [monetaryType, setMonetaryType] = useState("dining");

    addReward = () => { 
        if (!isNaN(parseFloat(rewardValue))) { 
            let index = rewards.findIndex(e => e.type === monetaryType);
            if (index !== -1) {
                let tempRewards = [...rewards];
                tempRewards.splice(index, 1,
                {
                    type : monetaryType,
                    value : rewardValue,
                });
                setRewards(tempRewards);
            } else {
                setRewards([
                    ...rewards,
                    {
                        type : monetaryType,
                        value : rewardValue,
                    }
                ])
            }
  
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
            cards.addCardToDatabase(name, [], rewardType, rewardsMap, url).then(async (cardId) => {
                await user.saveCardToUser(userId, cardId, null, null);
                navigation.navigate('YourCards', { forceLoad: true });
            });
        } 
    } 

    return (
        <DismissKeyboard>
            <SafeAreaView style={mainStyles.screen}>
                <BackButtonHeader navigation={navigation} title={"Add a Card Manually"} titleStyle={mainStyles.titleAligned} />
                <View style={mainStyles.bodyContainer}>

                <Text style={styles.inputTitle}>Credit Card Name</Text>
                <TextBox
                    style={!nameError ? styles.inputBox : styles.inputBoxError}
                    ref={inputName}
                    placeholder={'Your credit card title here '}
                />

                <Text style={styles.inputTitle}>Card Type</Text>
                <DropDownPicker
                    items={[
                        { label: 'Cashback', value: 'Cashback' },
                        { label: 'Points', value: 'Points' },
                        { label: 'Miles', value: 'Miles' },
                        { label: 'Unknown', value: 'Unknown' },
                    ]}
                    defaultValue={"Cashback"}
                    onChangeItem={item => setRewardType(item.value)}
                    containerStyle={{ height: 40, width: '40%', margin: 8, marginLeft: 15 }}
                    style={{ backgroundColor: '#fafafa' }}
                    itemStyle={{ justifyContent: 'flex-start' }}
                    dropDownStyle={{ backgroundColor: '#fafafa' }}
                />

                <Text style={styles.inputTitle}>Rewards</Text>
                <View style={styles.rewardContainer}>
                    {/* Already added rewards */}
                    {
                        displayRewards &&
                        <View style={styles.rewardText}>
                            {
                                rewards.map((reward, i) => {
                                    let type = reward.type.charAt(0).toUpperCase() + reward.type.slice(1);
                                    return <Text style={{ margin: 5 }} key={i}>{type}: {reward.value} cents</Text>
                                })
                            }
                        </View>
                    }

                    {/* reward error */}
                    {
                        rewardError &&
                        <Text style={{ color: 'red', marginHorizontal: 15 }}>Please input a number</Text>
                    }

                    {/* options to add reward */}
                    <View style={styles.rewardRow}>
                        <View style={styles.rewardRowContainer}>
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
                                onChangeItem={item => setMonetaryType(item.value)}
                                containerStyle={styles.dropdown}
                                style={{ backgroundColor: '#fafafa' }}
                                itemStyle={{ justifyContent: 'flex-start' }}
                                dropDownStyle={{ backgroundColor: '#fafafa' }}
                            />
                            <TextInput
                                style={styles.rewardInput}
                                onChangeText={(text) => setRewardValue(text)}
                                placeholder={'value in cents'}
                                placeholderTextColor={grayRGB}
                                value={rewardValue}
                                keyboardType={"number-pad"}
                                // onEndEditing={() => {
                                //     addReward();
                                //     setRewardValue("");
                                // }}
                            />
                            <TouchableOpacity
                                style={{width: '10%', justifyContent: 'center'}}
                                onPress={() => { addReward(), setRewardValue("") }}
                            >
                                <Ionicons
                                    name="checkmark-outline"
                                    color="black"
                                    size={26}
                                ></Ionicons>
                            </TouchableOpacity>
                        </View>
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
            </SafeAreaView>
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
    rewardRowContainer: { 
        display: 'flex',
        flexDirection: 'row', 
        minHeight: 10
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
        marginBottom: 8,
        padding: 10
    },
    inputBoxError : {
        margin: 15,
        height: 40,
        width: '90%',
        borderColor: 'red',
        borderWidth: 1,
        borderRadius: 5,
        marginTop: 8,
        marginBottom: 8,
        padding: 10
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
    },
    dropdown: {
        height: 40, 
        width: '40%',
        margin: 8,
        marginLeft: 15,
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
        marginBottom: 8,
        padding: 10
    },
});
const grayRGB = 'rgb(211, 211, 211)';