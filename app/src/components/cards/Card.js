import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Animated, ImageBackground } from 'react-native';
import { cards } from '../../network/cards';

function contrastRGB(string) {
  let color = string.split(",");
  let colorRGB = { r: parseInt(color[0].replaceAll("rgb(", "")), 
                   g: parseInt(color[1]),
                   b: parseInt(color[2])};
  // use the color brightness algorithm: https://www.w3.org/WAI/ER/WD-AERT/#color-contrast
  // [0, 255] range
  let brightness =(colorRGB.r * 299 + colorRGB.g * 587 + colorRGB.b * 114) / 1000;
  // return contrasting (white/black) color depending on the brightness
  return brightness > 128 ? "rgb(0, 0, 0)" : "rgb(255, 255, 255)";
}

class ImageLoader extends React.Component {
  state = {
    opacity: new Animated.Value(0),
  }

  onLoad = () => {
    Animated.timing(this.state.opacity, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }

  render() {
    return (
      <Animated.View
        style={[
          {
            opacity: this.state.opacity,
            transform: [
              {
                scale: this.state.opacity.interpolate({
                  inputRange: [0.25, 1],
                  outputRange: [0.85, 1],
                })
              },
            ],
          },
          this.props.style,
        ]}
      >
        <ImageBackground onLoad={this.onLoad} 
                         style={this.props.style} 
                         source={this.props.source} 
                         imageStyle={this.props.overlay.length == 0 ? {} : {tintColor: this.props.color}}>
          <Text style={[{color: contrastRGB(this.props.color)}, styles.overlay]}>{this.props.overlay}</Text>
        </ImageBackground>
      </Animated.View>
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
        flexDirection: 'row'
    }, 
    cardTitle: {
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 0,
        fontSize: 20 
    },
    overlay: {
      textAlign: 'right',
      fontWeight: 'bold',
      fontSize: 20,
      alignSelf: 'center',
      top: '-5%',
      left: '53%',
      flex: 0.6
    }
});

export class Card extends React.Component {
    constructor(props) { 
        super(props);

        this.state = {
            name: "",
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

    onPress = () => { 
        this.navigation.navigate('CardInfo', {
            cardId: this.cardId,
            docId: this.docId,
            img: this.state.showDefault ? require('../../../assets/cards/blank.png') : { uri: this.state.cardImage },
        })
    }

    render () {
        var image = this.state.showDefault ? require('../../../assets/cards/blank.png') : { uri: this.state.cardImage };
        var overlay = this.state.showDefault ? this.state.name : "";

        return (
            <View>
                <Text style={styles.cardTitle}>{this.state.name}</Text>
                <TouchableOpacity activeOpacity={0.5} onPress={this.onPress}>
                    <ImageLoader
                        style={styles.card}
                        source={image}
                        overlay={overlay}
                        color="rgb(128, 128, 128)"
                    />
                </TouchableOpacity>
            </View>
        );
    }
}