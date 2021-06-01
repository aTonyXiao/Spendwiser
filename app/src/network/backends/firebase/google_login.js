import * as Google from 'expo-google-app-auth'
import * as firebase from 'firebase';
import LoginAuthorizer from '../login_authorizer';

const iosClientID = '307958704226-gprtm07sev8ho8puqkjdkb9fa6m8enrl.apps.googleusercontent.com'
const iosStandaloneAppClientID =
    '307958704226-e3etjf7vngbf67j53g8qdotkgnbauhk8.apps.googleusercontent.com'
const androidClientID = '307958704226-ad9e31plqo0vlid3a2nql8of1rrpcsrj.apps.googleusercontent.com'
/**
 * Google login implementation using Expo's google authentication library: 'expo-google-app-auth'
 */
class GoogleLogin extends LoginAuthorizer {       
    async login() {
        // Note: Had to put the isoClientId into the Firebase Console Google
        // Sign in Safelist
        // This is because the project used to sign in with the expo-google-signin is
        // different than our firebase project...I think.
        // https://console.firebase.google.com/project/spendwiser-88be1/authentication/providers    
        const { type, accessToken, user } = await Google.logInAsync({
            iosClientId:iosClientID,
            iosStandaloneAppClientId: iosStandaloneAppClientID,
            androidClientId: androidClientID,
            androidStandaloneAppClientId: androidClientID,
        });

        if (type === 'success') {
            const credential = firebase.auth.GoogleAuthProvider.credential(null, accessToken);
            console.log(credential);
            firebase
                .auth()
                .signInWithCredential(credential)
                .catch(error => {
                    console.log("Google login error...");
                    console.log(error);
                });
        } else {
            console.log("Failed to sign in with google");
        }
    }
}

export default GoogleLogin;
