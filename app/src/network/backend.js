import BaseBackend from './backends/basebackend'
import FirebaseBackend from './backends/firebasebackend';

/**
 * The wrapped backend that the app will interface with.  Functions
 * inherited from 'BaseBackend' can be invoked from this object to
 * interact with the initialized backend from 'initializeAppBackend'
 */
export var appBackend;

/**
 * Set the app backend to a new instance of a supported type.
 * Modify this to add new supported backends
 */
function setAppBackend (type) {
    switch (type) {
        case "firebase":
            appBackend = new FirebaseBackend();
            break;
        default:
            appBackend = new BaseBackend();
    }
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
    appBackend.initializeApp();
    appBackend.enableDatabaseCaching();
}