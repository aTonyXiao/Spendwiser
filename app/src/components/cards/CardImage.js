import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ImageBackground 
} from 'react-native';
import CachedImage from 'react-native-expo-cached-image';
import sha1 from 'crypto-js/sha1';
import * as storage from '../../local/storage';
import { Ionicons } from '@expo/vector-icons';
import { Wave } from 'react-native-animated-spinkit';

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
    storage.getDisabledCards((val) => {
      const cardIdList = val['cards'];
      if (cardIdList.includes(cardId)) { 
        resolve(true);
      } else {
        resolve(false);
      }
    });
  })
}

/**
 * Component that displays a Credit Card Image. Either the card
 * image supplied via url will be displayed or a colorized background with a card's
 * name if no url is supplied.
 * 
 * @param {boolean} defaultImg - If true will return a colorized image with card's name. If false, the image supplied via source will be used
 * @param {string} source - Url of the image to be displayed if defaultImg is true
 * @param {string} overlay - Name of the card to be overlayed on top of the image
 * @param {*} style - Style properties that will be passed down to the Image component
 * @param {string} cardId - id of card 
 * @module CardImage
 */
function CardImage({
  style,
  source,
  overlay,
  defaultImg,
  cardId,
  cardToEnableDisable,
  setCardToEnableDisable,
  }) {
  // states that keep track of the component
  const [isLoading, setIsLoading] = useState(false);
  const [isCardDisabled, setIsCardDisabled] = useState(false);
  let generatedColor = generateColor(overlay);

  useEffect(() => {
    (async () => {
      setIsCardDisabled(await getIsCardDisabled(cardId));
    })()
  }, []);

  useEffect(() => {
    if (cardToEnableDisable !== null && cardToEnableDisable === cardId) {
      if (isCardDisabled !== null)
        setIsCardDisabled(!isCardDisabled);
      setCardToEnableDisable(null);
    }
  }, [cardToEnableDisable]);

  return (
    <View>
      <View style={styles.iconCentered}>
        {
          isCardDisabled && <Ionicons
              name="lock-closed"
              color={'black'}
              size={50}
          ></Ionicons>
        }
      </View>
      <View style={styles.iconCentered}>
        {
          isLoading && <Wave size={128} color="#088F8F" />
        }
      </View>
      
      {
        
        defaultImg ?
        <View style={isCardDisabled ? [styles.outerImageFaded, style] : [styles.outerImage, style]}>
          <ImageBackground style={styles.innerImage}
            source={require('../../../assets/cards/blank.png')}
            imageStyle={{ tintColor: generatedColor, resizeMode: "contain" }}>
            <Text style={[{ color: contrastRGB(generatedColor) }, styles.overlay]}>{overlay}</Text>
          </ImageBackground>
        </View>
        :
        <View style={isCardDisabled ? styles.faded : {}}>
          <CachedImage
            onLoadStart={() => setIsLoading(true)}
            onLoad={() => setIsLoading(false)}
            style={[styles.outerImage, style]}
            source={{ uri: source }}
          />
        </View>
      }
    </View>
    
  );
}

const styles = StyleSheet.create({
  outerImage: {
    justifyContent: 'center', 
    alignItems: 'center'
  },
  innerImage: {
      height: '100%',
      width: "100%",
      flexDirection: 'row'
  },
  outerImageFaded: {
    justifyContent: 'center', 
    alignItems: 'center',
    opacity: 0.5
  },
  faded: {
    opacity: 0.5,
  },
  overlay: {
    textAlign: 'right',
    fontWeight: 'bold',
    fontSize: 20,
    alignSelf: 'center',
    top: '-5%',
    left: '53%',
    flex: 0.6
  },
  iconCentered: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default CardImage;