import { app } from 'firebase';
import { appBackend } from './backend';

/**
 * A user class that peforms user database options
 */
export class userClass { 
    /**
     * Checks if the user is currently in the database. If not  
     * in the database, registers the user. Returns the user id
     */
    getUserId() { 
        var userId = appBackend.getUserID(); 
        if (userId == null) { 
            // user is not using a login, store all data locally?
            userId = "test"; // TODO test is temporary
        } else {
            var docExists = appBackend.dbDoesDocExist("users." + userId);

            if (!docExists) { 
                this.addUser(userId);
            }
        }
        return userId;
    }

    addUser(userId) { 
        // TODO 
        // appBackend.dbAdd("users" + userId, { 
        //     dateCreated: new Date()
        // },  
        // )
    }

    /**
     * Gets the cards associated with a user id
     * @param {string} userId - The User Id
     */
    getCards(userId) { 
        var cards = [];

        // TODO possibly need to handle empty cards here?
        appBackend.dbGetSubCollections("users." + userId + ".cards", (data) => { 
            cards.push(data.data());
        })

        return cards;
    }
}

export var user = new userClass();