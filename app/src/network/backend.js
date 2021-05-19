/**
 * The wrapped backend that the app will interface with.  Functions
 * inherited from 'BaseBackend' can be invoked from this object to
 * interact with the initialized backend from 'initializeAppBackend'
 */
export var appBackend;

export function setAppBackendVar(backend) {
    appBackend = backend;
    appBackend.initializeApp();
    appBackend.enableDatabaseCaching();
}