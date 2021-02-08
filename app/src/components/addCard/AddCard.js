import React from 'react';
import { View, Button } from 'react-native';
import mainStyles from '../../styles/mainStyles';

export class AddCard extends React.Component { 
    constructor(props) {
        super(props);

        this.navigation = props.navigation;
    }

    render() { 
        return(
            <View style={mainStyles.container}>
                <Button 
                    title='Add card by search'
                    onPress={() => this.navigation.navigate('AddCardSearch')}
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