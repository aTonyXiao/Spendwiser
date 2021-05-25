import React from 'react'
import { Dimensions, Text, View, Image, SafeAreaView, StyleSheet, StatusBar } from 'react-native';
import aboutImg from '../../../assets/about_img.png';
import mainStyles from '../../styles/mainStyles';
import { BackButtonHeader } from '../util/BackButtonHeader';
const width = Dimensions.get('window').width;

export function About(props) {
    return(
        <SafeAreaView style={mainStyles.screen}>
            <BackButtonHeader navigation={props.navigation} />
            <View style={[mainStyles.bodyContainer, styles.container]}>
                <View style={styles.nameContainer}>
                    <Image style={styles.img} source={aboutImg} alt={"About Us"}/>
                    <Text style={styles.groupName}>Troi and the Nathans</Text>
                    <Text>University of California, Davis</Text>
                    <Text>ECS193 Senior Design Project 2021</Text>
                </View>
                <View style={styles.descContainer}>
                    <Text>
                        The usage of Credit cards are very common nowadays.
                        There are variety of credit cards with different benefits including cash back, 
                        lower interest rate, travel rewards, etc. Some Credit cards has better benefits at 
                        certain than others, e.g. Discover Card has 5% Cash Back Calendar, Chase Sapphire 
                        Card can waive the insurance cost when you rent a car, etc. Therefore, it is 
                        very confusing and inconvenient for users to choose the right credit card 
                        during purchase to maximize the benefit.
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    nameContainer: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: 20,
    },
    groupName: {
        fontSize: 25,
    },
    img :{
        width: width * .5,
        height: width * .5,
        resizeMode: 'contain',
    },
    descContainer: {
        margin: 10,
        padding: 10,
        borderWidth: 1,
    }
});