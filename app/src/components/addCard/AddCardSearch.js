import React from 'react';
import { View, Button, Text } from 'react-native';
import mainStyles from '../../styles/mainStyles';
import { AddCardRow } from './AddCardRow';
import { TextBox } from '../TextBox';

export class AddCardSearch extends React.Component { 
    constructor(props) {
        super(props);

        this.TextBox = React.createRef();
        this.state = {
            error: null,
            isLoaded: false,
            displayCardOptions: false,
            results: [],
          };
        this.navigation = props.navigation;
        this.key = process.env.REACT_NATIVE_CCSTACK_API_KEY;
    }

    queryCards = async () => {
        var queryInput = this.TextBox.current;
        queryInput = encodeURI(queryInput.state.text);

        fetch("https://api.ccstack.io/v1/search/cards?api_key=" + this.key + "&query=" + queryInput)
            .then(res => res.json())
            .then(
                (result) => {
                    this.setState({
                        isLoaded: true,
                        results: result
                    });

                    // TODO want to handle case of no results
                    // console.log(results);

                    this.setState({
                        displayCardOptions: true
                    })
                },
                (error) => {
                    this.setState({
                        isLoaded: true,
                        error
                    });
                }
            )
    }

    render() { 
        return(
            <View style={mainStyles.container}>
                <TextBox ref={this.TextBox} placeholder={'  your credit card name'}/>
                <Button
                    title='Query for cards'
                    onPress={this.queryCards}
                />
                {
                    this.state.displayCardOptions && 
                    <View>
                        {this.state.results.results.map((card, i) => {
                            var props = {
                                navigation: this.navigation,
                                card: card
                            }

                            return (
                                <AddCardRow key={i} props={props}></AddCardRow>
                            )
                        })}
                    </View>
                }
            </View>
        );
    }
}