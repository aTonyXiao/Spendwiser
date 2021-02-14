import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Button, View } from 'react-native';
import mainStyles from '../../styles/mainStyles';
import { Card } from './Card';
import { user } from '../../network/user';
import { appBackend } from '../../network/backend';

const styles = StyleSheet.create({
    scrollView: {
        width: "95%"
    },
});

export class Cards extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            cards: [],
            displayCards: false
        }

        this.navigation = props.navigation;

        var userId = user.getUserId();
        console.log('line 26');
        console.log(userId);
        appBackend.dbGetSubCollections("users." + userId + ".cards",(data) => { 
            this.addCard(data.data());
        })
        // var cards = user.getCards(userId);
        // console.log(cards);

        // if (cards.length == 0) { 
        //     // display 'No cards!'
        // } else { 
        //     // set cards state
        // }
    }

    componentDidMount() { 
        this.setState({displayCards:true});
    }

    addCard = (card) => {
        this.state.cards.push(card);
        this.setState({cards: this.state.cards});
    }

    buttonPress = () => {
        this.navigation.navigate('AddCard');
    }

    render () {
        return (
            <SafeAreaView style={mainStyles.container}>
                <ScrollView style={styles.scrollView}>
                    {
                        this.state.displayCards && 
                        <View>
                            {this.state.cards.map((card, i) => {
                                var props = {
                                    navigation: this.navigation,
                                    card: card
                                }

                                return <Card key={i} props={props}/>
                            })}
                        </View>
                    }
                    <Button title="Add Card" onPress={this.buttonPress}/>
                </ScrollView>
            </SafeAreaView>
        );
    }
}