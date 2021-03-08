import * as Google from 'expo-google-app-auth'
import * as firebase from 'firebase';
import LoginAuthorizer from '../login_authorizer';

const iosClientID = '989741516714-hqrk7f1k8vkab4c6g8h0qai6nl1cv41f.apps.googleusercontent.com'
const iosStandaloneAppClientID =
      '989741516714-fqhdv9b748k8gt5tpclgt2ji79r9pj9r.apps.googleusercontent.com'


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
        }
    }
}

export default GoogleLogin;
