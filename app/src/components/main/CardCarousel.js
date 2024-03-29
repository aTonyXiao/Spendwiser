import React, { 
    useState, 
    useEffect,
    useRef, 
    useCallback
} from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    StyleSheet, 
    Dimensions 
} from 'react-native';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import CardImage from '../cards/CardImage';
import { Wave } from 'react-native-animated-spinkit';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;
const itemWidth = Math.round(width * 0.7);
const slideHeight = Math.round(height * 0.3);
const itemHorizontalMargin = Math.round(width / 50);
const entryBorderRadius = 8;


/**
 * Card Carousel displayed on Main Screen's bottom panel which displays the recommended cards
 * @param {Object} obj - Object from Main Screen to be passed here
 * @param {array} obj.recCards - Array of user's cards
 * @param {Object} obj.navigation - Navigation prop to redirect users to other pages
 * @param {array} obj.storeArr - Array of user surrounding stores
 * @param {int} obj.curStoreKey - Current selected store key in the store array
 * @module CardCarousel
 * @see MainScreen
 */
export function CardCarousel(
    {
        recCards,
        navigation,
        storeArr,
        curStoreKey,
    }) {
    const [recIdx, setRecIdx] = useState(0);
    const ref = useRef(null);
    const [cardToEnableDisable, setCardToEnableDisable] = useState(null);
    
    useEffect(() => {
        setRecIdx(0);
        if (ref.current !== null)
            ref.current.snapToItem(0);
    }, [recCards]);

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
                style={{justifyContent: 'center', alignItems: 'center'}}
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
                    defaultImg={item.cardImg.length == 0}
                    cardId={item.cardId}
                    cardToEnableDisable={null}
                    setCardToEnableDisable={null}
                />
            </View>
        </TouchableOpacity>
    ), []);


    return (
        <View style={carouselStyles.cardContainer}>
            {recCards === null ?
                <Wave size={128} color="#088F8F" />
                :
                recCards.length === 0 ?
                <TouchableOpacity 
                    onPress={()=>  navigation.navigate('YourCards', { 
                        storeInformation: storeArr[curStoreKey]
                    })}
                    style={{paddingVertical: 20, paddingHorizontal: 30, backgroundColor: '#5F9EA0', borderRadius: 3, marginTop: 10}}>
                    <Text style={{textAlign: 'center'}}>You have no enabled cards. {"\n"} Click here to get started!</Text>
                </TouchableOpacity>
                :
                <View>
                    <Text style={carouselStyles.recommendedCardText}>Your Recommended Cards</Text>
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
        </View>
    )
}


const carouselStyles = StyleSheet.create({
    cardContainer: {
        flex: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    slider: {
        marginVertical: 5,
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
        alignSelf: 'center'
    }
});