import React, { useState, useRef, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import CardImage from '../cards/CardImage';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;
const itemWidth = Math.round(width * 0.7);
const slideHeight = Math.round(height * 0.3);
const itemHorizontalMargin = Math.round(width / 50);
const entryBorderRadius = 8;

export function CardCarousel(
    {
        recCards,
        navigation,
        storeArr,
        curStoreKey
    }) {
    const [recIdx, setRecIdx] = useState(0);
    const ref = useRef(null);

    recommendedCardPressed = (item) => {
        if (item !== null) {
            navigation.navigate('CardInfo', {
                cardId: item.cardId,
                docId: item.docId,
                storeInformation: storeArr[curStoreKey],
                img: { uri: item.cardImg },
                origin: "main"
            })
        }
    };
    
    const renderItem = useCallback(({ item, index }) => (
        <TouchableOpacity
                activeOpacity={1}
                style={carouselStyles.slideInnerContainer}
                onPress={() => { recommendedCardPressed(item) }}
                >
            <View style={carouselStyles.imageContainer}>
                <CardImage
                    style = {{ 
                        width: width * .8,  //its same to '20%' of device width
                        aspectRatio: 1.5, // <-- this
                        resizeMode: 'contain', //optional
                    }}
                    source={item.cardImg}
                    overlay={item.cardName}
                    default={item.cardImg.length == 0}
                />
            </View>
        </TouchableOpacity>
        ), []);

    return (
        <View style={carouselStyles.cardContainer}>
            {/* display if cards are still loading */}
            {
                recCards == null && 
                <Image source = {require("../../../assets/load.jpg")}
                    style = {{ 
                        width: width * .8,  //its same to '20%' of device width
                        aspectRatio: 1.5, // <-- this
                        resizeMode: 'contain', //optional
                    }}
                />
            }

            {/* display if cards are loaded and more than one cards */}
            {
                ((recCards != null) && (recCards.length > 0)) &&
                <View>
                    <Text style={carouselStyles.recommendedCardText}>Your Recommended Card</Text>
                    <Carousel
                        layout={"default"}
                        ref={ref}
                        data={recCards}
                        sliderWidth={width}
                        itemWidth={itemWidth}
                        renderItem={renderItem}
                        inactiveSlideScale={0.7}
                        inactiveSlideOpacity={0.7}
                        containerCustomStyle={carouselStyles.slider}
                        contentContainerCustomStyle={carouselStyles.sliderContentContainer}
                        onSnapToItem={(index) => setRecIdx(index)}
                    />
                    <Pagination
                        dotsLength={recCards.length}
                        activeDotIndex={recIdx}
                        dotColor={"green"}
                        containerStyle={{paddingVertical:0}}
                        dotContainerStyle={{marginHorizontal:3}}
                        dotStyle={carouselStyles.paginationDot}
                        inactiveDotColor={"black"}
                        inactiveDotOpacity={0.4}
                        inactiveDotScale={0.7}
                    />
                </View>
            }

            {/* display if user has no cards */}
            {
                ((recCards != null) && (recCards.length == 0)) &&
                <View>
                    <Text style={carouselStyles.noCardsText}>You currently have no cards. Add some on the next page over to get a recommended card!</Text>
                </View>
            }
        </View>
    )
}


const carouselStyles = StyleSheet.create({
    cardContainer: {
        flex: 5,
        alignItems: 'center',
        justifyContent: 'center'
    },
    slider: {
        marginTop: 5,
        flexGrow: 0,
        overflow: 'visible', // for custom animations
    },
    sliderContentContainer: {
        paddingVertical: 0, // for custom animation
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 1
    },
    slideInnerContainer: {
        width: itemWidth,
        height: slideHeight,
        alignItems: 'center',
        paddingHorizontal: itemHorizontalMargin,
        // paddingBottom: 18 // needed for shadow
    },
    imageContainer: {
        flex: 1,
        backgroundColor: 'white',
        borderTopLeftRadius: entryBorderRadius,
        borderTopRightRadius: entryBorderRadius,
    },
    noCardsText: { 
        fontStyle: 'italic',
        margin: 5
    },
    recommendedCardText: {
        fontSize: 17, 
        paddingTop: 5,
        alignSelf: 'center'
    }
});