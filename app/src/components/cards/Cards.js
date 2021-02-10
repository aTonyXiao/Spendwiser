import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Button, View } from 'react-native';
import mainStyles from '../../styles/mainStyles';
import { Card } from './Card';
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

        // var user = appBackend.getUserID(); // TODO on login, user should sync with firebase - check if already has a document, if not add one
        // if (user == null) { 
        //     // user is not using a login, store all data locally?
        // } else {
        //     // TODO case if user has not added cards to db?

        //     appBackend.dbGetSubCollections("users." + user + ".cards",(data) => { 
        //         this.addCard(data.data());
        //     })
        // }

        var user = "test";
        appBackend.dbGetSubCollections("users." + user + ".cards",(data) => { 
            this.addCard(data.data());
        })
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