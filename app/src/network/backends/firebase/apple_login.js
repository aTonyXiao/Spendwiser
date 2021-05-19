import * as firebase from 'firebase';
import * as AppleAuthentication from "expo-apple-authentication";
import LoginAuthorizer from '../login_authorizer';

// ref: https://github.com/brix/crypto-js
import sha256 from 'crypto-js/sha256';

function generateNonce(length) {
    const chars_avail = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    let result = "";

    while (length-- > 0) result += chars_avail.charAt(Math.floor(Math.random() * chars_avail.length));

    return result;
}

/**
 * Apple login implementation using Expo's apple authentication library: 'expo-apple-authentication'
 */
class AppleLogin extends LoginAuthorizer {       
    async login() {
        try {
            // generate nonce
            const nonce = generateNonce(10);
            const hashedNonce = sha256(nonce).toString();

            // NOTE: can generate a nonce and state to prevent replay attacks
            // ref: https://docs.expo.io/versions/latest/sdk/apple-authentication/
            const { identityToken, email, state } = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
                nonce: hashedNonce
            });
            
            // Firebase sign in
            // ref: https://firebase.google.com/docs/auth/web/apple#configure-sign-in-with-apple
            const provider = new firebase.auth.OAuthProvider("apple.com");
            const credential = provider.credential({ idToken: identityToken, rawNonce: nonce });
            firebase.auth().signInWithCredential(credential).catch(err => {
                console.log("Apple login error...");
                console.log(err);
            });
        } catch (e) {
            console.log(e.code === "ERR_CANCELED" ? "Apple login canceled" : "Failed to sign in with apple, error: " + e);
        }
    }
}

export default AppleLogin;
