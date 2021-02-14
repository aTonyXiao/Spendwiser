import React from 'react';
import { Button, View } from 'react-native';
import { TextBox } from '../TextBox';
import { appBackend } from '../../network/backend';
import { user } from '../../network/backend';

export class AddCardManual extends React.Component {
    constructor(props) { 
        super(props);

        this.inputName = React.createRef();
        this.inputRewards = React.createRef(); // TODO this should be a list

        this.navigation = props.navigation;
    }

    onPress = () => { 
        // var user = user.getUserId();
        var user = "test";

        var name = this.inputName.current.state.text;
        var rewards = this.inputRewards.current.state.text;

        appBackend.dbAdd("users." + user + ".cards", {
            name: name,
            rewards: rewards,
        }, (id) => { 
            console.log(id);
        })

        this.navigation.navigate('Cards');
    } 

    render () {
        return (
            <View>
                <TextBox ref={this.inputName} placeholder={'your credit card title here '}/>
                <TextBox ref={this.inputRewards} placeholder={'your rewards here'}/>
                <Button
                    title='Add this card'
                    onPress={this.onPress}
                />
            </View>
        );
    }
}