import React from 'react';
import { View, Button, TextInput } from 'react-native';
import { useState } from 'react';
import { AddCardRow } from './AddCardRow';
import { user } from '../../network/user';
import mainStyles from '../../styles/mainStyles';
import { cards } from '../../network/cards';

export function AddCardDB({navigation}) {
    const [displayCardOptions, setDisplayCardOptions] = useState(false);
    const [results, setResults] = useState([]);
    const userId = user.getUserId();
    const [text, setText] = useState("");

    function queryCards() {
        // TODO query our database and create reference/add to user
        cards.someGetFunction(text).then((result)=> { 
            setResults(result);
            setDisplayCardOptions(true);
        })
    }

    // TODO add some autocorrect feature here
    onChangeText = (val) => {
        setText(val);
    }

    return (
        <View style={mainStyles.container}>
            <TextInput
                onChangeText={(text) => this.onChangeText(text)}
                placeholder={"search here"}
            />
            <Button
                title='Query for cards'
                onPress={queryCards}
            />
            {
                displayCardOptions &&
                <View>
                    {results.map((card, i) => {
                        var props = {
                            navigation: navigation,
                            card: card
                        }

                        return (
                            <AddCardRow key={i} props={props}></AddCardRow>
                        )
                    })}
                </View>
            }
        </View>
    )
}