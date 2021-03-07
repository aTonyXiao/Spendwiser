import React from 'react';
import { cards } from '../../network/cards';
import { Text, View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import CardImage from './CardImage';

export class Card extends React.Component {
    constructor(props) { 
        super(props);

        var cardInformation = props.props.card;
        this.state = {
            name: "",
            cardImage: "Not an Empty String",
            showDefault: true,
            opacity: new Animated.Value(0),
            cardId: cardInformation.cardId,
            navigation: props.props.navigation,
            docId: cardInformation.docId,
            storeInformation: props.props.storeInformation
        }

        cards.getCardImageURL(this.state.cardId).then((url) => {
            this.setState({cardImage: url, showDefault: url.length == 0});
        });

        cards.getCardName(this.state.cardId).then((cardName) => {
            this.setState({name: cardName});
        });
    }

    onPress = () => { 
        this.state.navigation.navigate('CardInfo', {
            cardId: this.state.cardId,
            docId: this.state.docId,
            storeInformation: this.state.storeInformation,
            img: this.state.showDefault ? require('../../../assets/cards/blank.png') : { uri: this.state.cardImage },
        })
    }

    render () {
        return (
            <View>
                <Text style={styles.cardTitle}>{this.state.name}</Text>
                <TouchableOpacity activeOpacity={0.5} onPress={this.onPress}>
                    <CardImage
                        style={[ styles.card ]}
                        source={this.state.cardImage}
                        overlay={this.state.name}
                        default={this.state.showDefault}
                    />
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    scrollView: {
        width: "95%",
    },
    card: {
        resizeMode: "contain",
        width: "100%",
        height: 230, // hard coded for now
        marginBottom: 10
    }, 
    cardTitle: {
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 0,
        fontSize: 20 
    }
});