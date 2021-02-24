import React from 'react';
import CachedImage from 'react-native-expo-cached-image';
import { cards } from '../../network/cards';
import { Text, View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import CardImage from './CardImage';

const styles = StyleSheet.create({
    scrollView: {
        width: "95%"
    },
    card: {
        resizeMode: "contain",
        width: "100%",
        height: 230, // hard coded for now
        marginBottom: 10,
        flexDirection: 'row'
    }, 
    cardTitle: {
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 0,
        fontSize: 20 
    }
});

export class Card extends React.Component {
    constructor(props) { 
        super(props);

        this.state = {
            name: "",
            cardImage:"",
            showDefault: true,
            opacity: new Animated.Value(0),
        }

        var cardInformation = props.props.card;
        this.cardId = cardInformation.cardId;
        this.navigation = props.props.navigation;
        this.docId = cardInformation.docId;
        cards.getCardImageURL(this.cardId).then((url) => {
            this.setState({cardImage: url});
            this.setState({showDefault: false}); 
            console.log(url);
        });

        cards.getCardName(this.cardId).then((cardName) => {
            this.setState({name: cardName});
        });
    }

    onPress = () => { 
        this.navigation.navigate('CardInfo', {
            cardId: this.cardId,
            docId: this.docId,
            img: this.state.showDefault ? require('../../../assets/cards/blank.png') : { uri: this.state.cardImage },
        })
    }

    onLoad = () => {
      Animated.timing(this.state.opacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }

    render () {
        var image = this.state.showDefault ? require('../../../assets/cards/blank.png') : { uri: this.state.cardImage };
        var overlay = this.state.showDefault ? this.state.name : "";

        return (
            <View>
                <Text style={styles.cardTitle}>{this.state.name}</Text>
                <TouchableOpacity activeOpacity={0.5} onPress={this.onPress}>
                    <CardImage
                        style={[ styles.card, { opacity: this.state.opacity }]}
                        source={image}
                        onLoad={() => this.onLoad()}
                        overlay={overlay}
                    />
                </TouchableOpacity>
            </View>
        );
    }
}