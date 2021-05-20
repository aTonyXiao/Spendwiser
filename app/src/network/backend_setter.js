import BaseBackend from './backends/basebackend'
import FirebaseBackend from './backends/firebasebackend';
import ServerBackend from './backends/serverbackend';
import {setAppBackendVar} from './backend'

/**
 * Set the app backend to a new instance of a supported type.
 * Modify this to add new supported backends
 */
function setAppBackend (type) {
    var appBackend;
    switch (type) {
        case "firebase":
            appBackend = new FirebaseBackend();
            break;
        case "server":
            appBackend = new ServerBackend();
            break;
        default:
            appBackend = new BaseBackend();
    }
    setAppBackendVar(appBackend);
}

/**
 * Initializes the current backend to the given type denoted by a string.
 * 
 * Currently supported backends:
 *   - 'firebase'
 * 
 * @param {string} type - The backend type to initialize
 */
export function initializeAppBackend (type) {
    setAppBackend(type);
}