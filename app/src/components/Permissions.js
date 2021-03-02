import React, {useState} from 'react';
import { View, Button, Text, Alert } from 'react-native';
import * as Permissions from 'expo-permissions';

export function AppPermissions() {
    const [ loading, setLoading ] = useState(true);
    const [ notificationStatus, setNotificationStatus ] = useState("undetermined");
    const [ cameraStatus, setCameraStatus ] = useState("undetermined");

    
    let getPermissions = async () => {
        const notifications = await Permissions.getAsync(Permissions.NOTIFICATIONS);
        const camera = await Permissions.getAsync(Permissions.CAMERA);

        console.log(notifications);
        setNotificationStatus(notifications.status);
        setCameraStatus(camera.status);
        setLoading(false);
    }
    //const [permission, askForPermission] = Permissions.usePermissions(Permissions.CAMERA, { ask: false });


    if (loading) {
        getPermissions();
        return(
            <View>
                <Text>loading</Text>
            </View>
        )
    } else {
        return (
            <View>
                <Button
                    title="Notifications"
                    onPress={() => {
                        if (notificationStatus === 'undetermined' ||
                            notificationStatus === 'denied') {
                            Alert.alert("Please enable notifications in settings");
                        }
                    }}
                />
                <Button
                    title="Camera"
                    onPress={() => {
                        if (cameraStatus === 'undetermined' ||
                            cameraStatus ===  'denied') {
                            Alert.alert("Please enable camera in settings");
                        }
                    }}
                />
            </View>
        );
    }
   
}
