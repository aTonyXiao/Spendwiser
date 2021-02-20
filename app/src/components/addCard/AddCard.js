import React from 'react';
import { View, Button } from 'react-native';
import mainStyles from '../../styles/mainStyles';
import { Ionicons } from '@expo/vector-icons';

export class AddCard extends React.Component { 
    constructor(props) {
        super(props);

        this.navigation = props.navigation;
    }

    render() { 
        return(
            <View style={mainStyles.container}>
                <Button
                    title='Add card from our database'
                    onPress={() => this.navigation.navigate('AddCardDB')}
                ></Button>
                <Button 
                    title='Add card Manually'
                    onPress={() => this.navigation.navigate('AddCardManual')}
                ></Button>
                <Button 
                    title='Add card by camera'
                    onPress={() => this.navigation.navigate('AddCardCamera')}
                ></Button>
            </View>
        );
    }
}