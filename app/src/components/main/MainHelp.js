import React, { useState, useRef, useCallback } from 'react';
import { View, Text, SafeAreaView, StyleSheet, Dimensions, TouchableOpacity, Image } from 'react-native';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import mainStyles from '../../styles/mainStyles';
import { BackButtonHeader } from '../util/BackButtonHeader';
import { StackActions } from '@react-navigation/native';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;
const itemWidth = Math.round(width * 0.8);
const slideHeight = Math.round(height * 0.7);
const itemHorizontalMargin = Math.round(width / 50);
const entryBorderRadius = 8;

export function MainHelp({navigation}) {
    const [idx, setIdx] = useState(0);
    const ref = useRef(null);
    const [idxArr, setIdxArr] = useState([0,1,2,3]);

    const helpLocation = () => (
        <View style={{paddingVertical: 10}}>
            <Image
                style={styles.image}
                source={require('../../../assets/help-location.png')}
            />
            <View style={styles.textArea}>
                <Text style={{fontSize: 16, fontWeight: 'bold', paddingBottom: 10}}>Location FAQ</Text>
                <Text>
                {"Enabling location and having a stable internet connection will enable all app functionalities."}
                {"\n\n"}
                {"If location is disabled, Spendwiser will not retrieve stores around your location."}
                {"\n\n"}
                {"However, you will still have access to all other functionalities."}
                {"\n\n"}
                {"Click the User Icon in the maps screen to re-center your location,"}
                {"or if location is disabled, click to re-enable permissions."}
                </Text>
            </View>
        </View>
    );

    const helpPOI = () => (
        <View style={{paddingVertical: 10}}>
            <Image
                style={styles.image}
                source={require('../../../assets/help-poi.png')}
            />
            <View style={styles.textArea}>
                <Text style={{fontSize: 16, fontWeight: 'bold', paddingBottom: 10}}>Point Of Interest FAQ</Text>
                <Text>
                {"If location and internet is enabled, Spendwiser will retrieve stores around your location."}
                {"\n\n"}
                {"If Spendwiser has internet access, users can click markers on the map"}
                {"to add the selected store into your store list and set it as your current store."}
                {"\n\n"}
                {"You can also change your current store by clicking the Search Icon"}
                {"\n\n"}
                {"If you do not see a store on the map, or if you do not have an internet connection, "}
                {"you can manually add a store by clicking the Search Icon"}
                </Text>
            </View>
        </View>
    );

    const helpCards = () => (
        <View style={{paddingVertical: 10}}>
            <Image
                style={styles.image}
                source={require('../../../assets/help-cards.png')}
            />
           <View style={styles.textArea}>
                <Text style={{fontSize: 16, fontWeight: 'bold', paddingBottom: 10}}>Cards FAQ</Text>
                <Text>
                {"Swipe the bottom panel up on the map screen to view your recommended cards."}
                {"\n\n"}
                {"Clicking a card will display the card's rewards and your past transactions on it, "}
                {"allowing you to add, edit, or delete transactions."}
                </Text>
            </View>
        </View>
    );

    const helpInternet = () => (
        <View style={{paddingVertical: 10}}>
            <Image
                style={styles.image}
                source={require('../../../assets/help-internet.png')}
            />
            <View style={styles.textArea}>
                <Text style={{fontSize: 16, fontWeight: 'bold', paddingBottom: 10}}>Internet FAQ</Text>
                <Text>
                {"Enabling location and having a stable internet connection will enable all app functionalities."}
                {"\n\n"}
                {"You can see if the internet is reachable based on the Cloud Icon on the top right of the map screen"}
                {"\n\n"}
                {"If there is no internet connection, Spendwiser will not retrieve stores around your location,"}
                {"and you will not be able to select stores on the map."}
                {"\n\n"}
                {"However, you can still manually add stores to get your recommended cards"}
                </Text>
            </View>
        </View>
    );
    
    const renderItem = useCallback(({ item, index }) => (
        <View style={carouselStyles.slideInnerContainer}>
            {index === 0 && helpLocation()}
            {index === 1 && helpInternet()}
            {index === 2 && helpPOI()}
            {index === 3 && helpCards()}
        </View>
    ), []);

    return (
        <SafeAreaView style={styles.screen}>
            <BackButtonHeader navigation={navigation} titleStyle={mainStyles.titleNoPadding} />
            <View>
                <Carousel
                    layout={"default"}
                    ref={ref}
                    data={idxArr}
                    sliderWidth={width * 0.9}
                    itemWidth={itemWidth}
                    renderItem={renderItem}
                    inactiveSlideScale={0.7}
                    inactiveSlideOpacity={0}
                    containerCustomStyle={carouselStyles.slider}
                    contentContainerCustomStyle={carouselStyles.sliderContentContainer}
                    onSnapToItem={(index) => setIdx(index)}
                />
                <Pagination
                    dotsLength={idxArr.length}
                    activeDotIndex={idx}
                    dotColor={"green"}
                    containerStyle={{paddingVertical:0}}
                    dotContainerStyle={{marginHorizontal:3}}
                    dotStyle={carouselStyles.paginationDot}
                    inactiveDotColor={"black"}
                    inactiveDotOpacity={0.4}
                    inactiveDotScale={0.7}
                />
                <View style={{alignItems: 'center'}}>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => navigation.dispatch(StackActions.pop())}
                    >
                        <Text>Exit</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    screen: {
        backgroundColor: 'white',
        height: '100%',
        alignItems: 'center'
    },
    button: {
        textAlign: 'center',
        backgroundColor: '#28b573',
        margin: 15,
        height: 40, 
        borderRadius: 5,
        width: '40%',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20
    },
    image: {
        resizeMode: 'contain',
        maxHeight: slideHeight * 0.5,
    },
    textArea: {
        paddingTop: 15,
        paddingHorizontal: 10,
        height: slideHeight * 0.5,
        alignItems: 'center'
    }
});

const carouselStyles = StyleSheet.create({
    slider: {
        marginTop: 5,
        flexGrow: 0,
        overflow: 'visible', // for custom animations
        marginBottom: 15
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
    },
});