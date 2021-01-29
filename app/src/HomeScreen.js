import React from 'react';
import { StyleSheet, View , Button} from 'react-native';

export function HomeScreen({navigation}) {
    return (
        <View style={styles.container}>
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

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
