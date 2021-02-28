import React from 'react';
import { View, Button, Text } from 'react-native';
import * as Permissions from 'expo-permissions';

export function AppPermissions() {
    const [permission, askForPermission] = Permissions.usePermissions(Permissions.CAMERA, { ask: true });
    if (!permission || permission.status !== 'granted') {
        return (
            <View>
                <Text>Permission is not granted</Text>
                <Button title="Grant permission" onPress={askForPermission} />
            </View>
        );
    }

    return (
        <View>
            <Camera />
        </View>
    );
}
