import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { cards } from '../../network/cards';

class ImageLoader extends React.Component {
  state = {
    opacity: new Animated.Value(0),
  }

  onLoad = () => {
    Animated.timing(this.state.opacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }

  render() {
    return (
      <Animated.Image
        onLoad={this.onLoad}
        {...this.props}
        style={[
          {
            opacity: this.state.opacity,
            transform: [
              {
                scale: this.state.opacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.85, 1],
                })
              },
            ],
          },
          this.props.style,
        ]}
      />
    );
  }
}

const styles = StyleSheet.create({
    scrollView: {
        width: "95%"
    },
    card: {
        resizeMode: "contain",
        width: "100%",
        height: 230, // hard coded for now
        marginBottom: 10,
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

        // can find a better way of loading in assets
        // this for a proof of concept for now

        this.state = {
            name: "",
            opacity: new Animated.Value(0),
            cardImage:"",
            showDefault: true,
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


    onLoad = () => {
        Animated.timing(this.state.opacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();
    }

    onPress = () => { 
        this.navigation.navigate('CardInfo', {
            cardId: this.cardId,
            docId: this.docId
        })
    }

    render () {
        var image = this.state.showDefault ? require('../../../assets/cards/blank.png') : { uri: this.state.cardImage };

        return (
            <View>
                <Text style={styles.cardTitle}>{this.state.name}</Text>
                <TouchableOpacity activeOpacity={0.5} onPress={this.onPress}>
                    <ImageLoader
                        style={styles.card}
                        source={image}
                    />
                </TouchableOpacity>
            </View>
        );
    }
}