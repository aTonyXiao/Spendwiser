import React from 'react';
import { View, Text, StyleSheet, Button, Image } from 'react-native';
import mainStyles from '../styles/mainStyles';

export function HomeScreen({navigation}) {
    return (
        <View style={styles.screen}>
            <Image source={require('../../assets/spendwiser_logo.png')} />
            <View style={{marginBottom: 10}}>
                <Button
                    title="Login"
                    onPress={() => navigation.navigate('Login')}
                ></Button>
            </View>
            <Button
                title="Create an Account"
                onPress={() => navigation.navigate('CreateAccount')}
            ></Button>
            <Button
                title="Temp to Main"
                onPress={() => navigation.navigate('Main')}
            ></Button>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
})