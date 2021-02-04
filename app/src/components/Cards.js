import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Button, Image } from 'react-native';
import mainStyles from '../styles/mainStyles';

// can find a better way of loading in assets
// this for a proof of concept for now
const CardImage = require("../../assets/cards/blank.png");

const styles = StyleSheet.create({
    scrollView: {
        width: "95%"
    },
    card: {
        resizeMode: "contain",
        width: "100%",
        height: 300 // hard coded for now
    }
});

const Card = (props) => {
    return (
        <Image source={props.src} style={styles.card} />
    );
}

export class Cards extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            cards: []
        }

        this.navigation = props.navigation;
    }

    addCard = (card) => {
        this.state.cards.push(card);
        this.setState({cards: this.state.cards});
    }

    buttonPress = () => {
        // this.addCard(CardImage);
        this.navigation.navigate('AddCard');
    }

    render () {
        return (
            <SafeAreaView style={mainStyles.container}>
                <ScrollView style={styles.scrollView}>
                    <Button title="Add Card" onPress={this.buttonPress} />
                    {/* {this.state.cards.map((card) => {
                        return <Card src={card} />
                    })} */} 
                </ScrollView>
            </SafeAreaView>
        );
    }
}