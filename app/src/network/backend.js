import BaseBackend from './backends/basebackend'
import FirebaseBackend from './backends/firebasebackend';

export var appBackend;

function setAppBackend (type) {
    switch (type) {
        case "firebase":
            appBackend = new FirebaseBackend();
            break;
        default:
            appBackend = new BaseBackend();
    }
}

export function initializeAppBackend (type) {
    setAppBackend(type);
    appBackend.initializeApp();
}