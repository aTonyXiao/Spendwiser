import React, { 
    useState, 
    useRef, 
    useCallback,
    useEffect
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
import * as storage from '../../local/storage';

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
        curStoreKey,
    }) {
    const [recIdx, setRecIdx] = useState(0);
    const ref = useRef(null);
    const [disabledCards, setDisabledCards] = useState([]);
    const [hasConstructed, setHasConstructed] = useState(false);
    // check for disabled cards
    useEffect(() => {
        const updateIfNeeded = async () => {
            if (!hasConstructed) {
                setDisabledCards(await getDisabledCards());

                // remove disabled cards from array
                if (recCards != null) {
                    for (let i = 0; i < recCards.length; i++) {
                        if (disabledCards.includes(recCards[i].cardId)) {
                            recCards.splice(i, 1);
                        }
                    }

                    setHasConstructed(true);
                }
            }
        }
        updateIfNeeded();
    })

    /**
    * calls storage function to check if card is disabled
    * @returns {array} - is the card disabled or not
    */
    async function getDisabledCards() {
        return new Promise((resolve, reject) => {
            storage.getDisabledCards((val) => {
                let cardIdList = val['cards'];
                resolve(cardIdList);
            });
        })
    }

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
                    default={item.cardImg.length == 0}
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
                    <Text style={{textAlign: 'center'}}>You currently have no cards. {"\n"} Click here to get started!</Text>
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