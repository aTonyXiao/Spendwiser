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
                        The usage of credit cards has increased over the years
                        and more businesses are accepting them. However, with the large range of credit cards
                        , each with their own set of rewards and benefits, cardholders who own multiple of 
                        them might be confused as to which credit card he/she should use in a given store. 
                        Moreover, cardholders who possess multiple credit cards might wish to have an 
                        application that can keep track of his/her overall spendings.
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