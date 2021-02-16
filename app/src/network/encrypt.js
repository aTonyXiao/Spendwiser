// https://www.npmjs.com/package/cryptr
import { Cryptr } from 'cryptr';

export function encryptTest () {
    const crypt = new Cryptr("key");
    console.log(crypt.encrypt("hello"));
}