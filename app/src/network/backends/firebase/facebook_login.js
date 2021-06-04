import * as Facebook from 'expo-facebook';
import * as firebase from 'firebase';
import LoginAuthorizer from '../login_authorizer';

/**
 * Facebook login using Expo's facebook login library
 */
class FacebookLogin extends LoginAuthorizer {
    async login() {
        await Facebook.initializeAsync({ appId: '' });

        const { type, token } = await Facebook.logInWithReadPermissionsAsync({
            permissions: ['public_profile'],
        });
    
        const cred = await Facebook.getAuthenticationCredentialAsync();
        if (type === 'success') {
            // Build Firebase credential with the Facebook access token.
            const credential = firebase.auth.FacebookAuthProvider.credential(cred.token);

            // Sign in with credential from the Facebook user.
            firebase
                .auth()
                .signInWithCredential(credential)
                .catch(error => {
                    // Handle Errors here.
                    console.log("Facebook login error...");
                    console.log(error)
                });
        }
    }
}

export default FacebookLogin;