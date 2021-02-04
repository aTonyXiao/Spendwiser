import BaseBackend from './backends/basebackend'
import FirebaseBackend from './backends/firebasebackend';

var currentBackend;

function setCurrentBackend (type) {
    switch (type) {
        case "firebase":
            currentBackend = new FirebaseBackend();
            break;
        default:
            currentBackend = new BaseBackend();
    }
}

export function appBackend () {
    return currentBackend;
}

export function initializeAppBackend (type) {
    setCurrentBackend(type);
    currentBackend.initializeApp();
    return currentBackend;
}