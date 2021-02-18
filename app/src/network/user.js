import { appBackend } from './backend';

/**
 * A user class that peforms user database options
 */
class userClass { 
    /**
     * Checks if the user is currently in the "users" database. If not  
     * in the database, registers the user. Returns the user id
     */
    getUserId() { 
        var userId = appBackend.getUserID(); 
        if (userId == null) { 
            // user is not using a login, store all data locally?
            userId = "test"; // TODO test is temporary
        } else {
            appBackend.dbDoesDocExist(userId).then((docExists) => {
                if (!docExists) {
                    this.addUser(userId);
                }
            });
        }
        return userId;
    }

    /**
     * Adds a user to the card database with inital date added
     * 
     * @param {String} userId - the user's id after logged in 
     */
    addUser(userId) { 
        var date = new Date();

        appBackend.dbSet("users." + userId, { 
            dateCreated: date
            // TODO: maybe add name and email here?
        }, (id) => { 
            console.log(id);
        });
    }

    /**
     * Gets the cards associated with a user id
     * @param {string} userId - The User Id
     */
    async getCards(userId) { 
        return new Promise((resolve, reject) => { 
            appBackend.dbGetSubCollections("users." + userId + ".cards", (data) => {
                resolve(data);
            })
        })
    }

    /**
     *  Deletes a card from the user's database 
     * @param {*} userId - current user id
     * @param {*} cardId - card id they want to delete
     */
    deleteCard(userId, cardId) { 
        appBackend.dbDelete("users." + userId + ".cards." + cardId);
    }

    /** 
     * 
     *
     */ 
    saveCardToUser(userId, cardId, transactions, diff) { 
        appBackend.dbAdd("users." + userId + ".cards", {
            cardId: cardId, 
            transactions: transactions,
            diff: diff
        }, (id) => { 
            console.log("successfully saved card to user");
        })
    }

    updateUserCard(cardId, amountSpent, diff) { 
        // TODO
    }
}

export var user = new userClass();