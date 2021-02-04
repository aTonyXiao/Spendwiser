import FirebaseBackend from './backends/firebase';

var currentBackend;

// base backend class
export class Backend {
    initializeApp () {}
    doesSupportDatabase () {}
}

function setCurrentBackend (type) {
    switch (type) {
        case "firebase":
            currentBackend = new FirebaseBackend();
            break;
        default:
            currentBackend = new Backend();
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