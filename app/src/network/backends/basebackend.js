// base backend class
export default class BaseBackend {
    initializeApp () {}
    doesSupportDatabase () {}
    dbGet (location, callback) {}
    dbSet (location, data) {}
    dbAdd (location, data, callback) {}
}