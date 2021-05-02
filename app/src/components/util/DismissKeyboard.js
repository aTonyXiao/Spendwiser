import React from 'react';
import { 
    Keyboard,  
    TouchableWithoutFeedback, 
    View
} from 'react-native';

/**
 * Wrapper for any input that uses keyboard that calls the "Keyboard.dismiss()" function
 * NOTE: it's important to wrap this around the main view of whatever screen it's being 
 *      used on, because the wrapper needs to receive feedback for pretty much the entire 
 *      screen for this to work
 * 
 * help from https://medium.com/@akshay.s.somkuwar/dismiss-hide-keyboard-on-tap-outside-of-textinput-react-native-b94016f35ff0
 * 
 * @example <DismissKeyboard>
                <View style={styles.container}>
                    <TextInput style={styles.input} placeholder="email" />   
                    <TextInput style={styles.input} placeholder="password" />
                </View>
            </DismissKeyboard>
 *
 * @param {*} children
 */
export const DismissKeyboard = ({ children }) => (
    <TouchableWithoutFeedback
        onPress={() => {
            Keyboard.dismiss()
        }}
    > 
        <View style={{position: 'absolute', width: '100%', height: '100%'}}> 
            {children}
        </View>
    </TouchableWithoutFeedback>
);