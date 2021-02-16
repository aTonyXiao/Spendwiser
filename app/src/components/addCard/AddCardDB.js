import React from 'react';
import {View, Button } from 'react-native';
import { useState } from 'react';
import { AddCardRow } from './AddCardRow';
import { user } from '../../network/user';
import mainStyles from '../../styles/mainStyles';

export function AddCardDB({navigation }) {
    const [displayCardOptions, setDisplayCardOptions] = useState(false);
    const [results, setResults] = useState([]);
    const userId = user.getUserId();

    function queryCards() {
        // TODO query our database and create reference

        // setDisplayCardOptions(true);
    }

    return (
        <View style={mainStyles.container}>
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