import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function HomeScreen() {
    return (
        <View style={styles.container}>
            {/* TODO Logo */}
            <Text>Login</Text>
            <Text>Create an Account</Text>
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
