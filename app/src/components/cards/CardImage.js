import React from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import CachedImage from 'react-native-expo-cached-image';
import sha1 from 'crypto-js/sha1';
import * as storage from '../../local/storage';
import { cards } from '../../network/cards';

/**
 * Generates a contrasting rgb value based on the supplied parameter
 * @param {string} string - rgb string
 * @returns {string} rgb string value
 */
function contrastRGB(string) {
  let color = string.split(',');
  color[0] = color[0].replace("rgb(", '');
  let colorRGB = { r: parseInt(color[0]), 
                   g: parseInt(color[1]),
                   b: parseInt(color[2])};
  // use the color brightness algorithm: https://www.w3.org/WAI/ER/WD-AERT/#color-contrast
  // [0, 255] range
  let brightness =(colorRGB.r * 299 + colorRGB.g * 587 + colorRGB.b * 114) / 1000;
  // return contrasting (white/black) color depending on the brightness
  return brightness > 128 ? "rgb(0, 0, 0)" : "rgb(255, 255, 255)";
}

/**
 * Generates an rgb value based on the named passed in
 * @param {string} string - The name of a credit card
 * @returns {string} rgb string value
 */
function generateColor(string) {
  let hashColor = sha1(string).toString().substring(0, 6);
  let colorRGB = { r: parseInt(hashColor.substring(0, 2), 16),
                   g: parseInt(hashColor.substring(2, 4), 16),
                   b: parseInt(hashColor.substring(4, 6), 16)};
  return "rgb(" + colorRGB.r + ", " + colorRGB.g + ", " + colorRGB.b + ")";
}

/**
 * calls storage function to check if card is disabled
 * @param {*} cardId 
 * @returns {boolean} - is the card disabled or not
 */
async function getIsCardDisabled(cardId) {
  return new Promise((resolve, reject) => {
    storage.getDisabledCards((list) => {
      if (list.includes(cardid)) { 
        resolve(true);
      } else {
        resovle(false);
      }
    });
  })
}

/**
 * Component that displays a Credit Card Image. Either the card
 * image supplied via url will be displayed or a colorized background with a card's
 * name if no url is supplied.
 * 
 * @param {boolean} props.default - If true will return a colorized image with card's name. If false, the image supplied via source will be used
 * @param {string} props.source - Url of the image to be displayed if @props.default is true
 * @param {string} props.overlay - Name of the card to be overlayed on top of the image
 * @param {*} props.style - Style properties that will be passed down to the Image component
 * @component
 *      
 */
function CardImage(props) {
  // const isDisabled = await getIsCardDisabled(props.id);

  if (props.default) {
    let generatedColor = generateColor(props.overlay);
    return (
      <View style={[{ justifyContent: 'center', alignItems: 'center' }, props.style]}>
        <ImageBackground style={styles.innerImage}
          source={require('../../../assets/cards/blank.png')}
          imageStyle={props.overlay.length == 0 ? {} : { tintColor: generatedColor, resizeMode: "contain" }}>
          <Text style={[{ color: contrastRGB(generatedColor) }, styles.overlay]}>{props.overlay}</Text>
        </ImageBackground>
      </View>
    );
  } else {
    return (
      <CachedImage
        style={[{ justifyContent: 'center', alignItems: 'center' }, props.style]}
        source={{ uri: props.source }}
      />
    );
  }
}

const styles = StyleSheet.create({
  innerImage: {
      height: '100%',
      width: "100%",
      flexDirection: 'row'
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

export default CardImage;