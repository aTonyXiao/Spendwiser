// https://github.com/brix/crypto-js
import aes from 'crypto-js/aes';

export function encryptTest () {
    console.log(aes.encrypt("hello", "key").toString());
}