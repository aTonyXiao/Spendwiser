import React from 'react';
import { View , Button} from 'react-native';
import mainStyles from '../styles/mainStyles';

export function HomeScreen({navigation}) {
    return (
        <View style={mainStyles.container}>
            <Button
                title="Login"
                onPress={() => navigation.navigate('Login')}
            ></Button>
            <Button
                title="Create an Account"
                onPress={() => navigation.navigate('CreateAccount')}
            ></Button>
        </View>
    );
}