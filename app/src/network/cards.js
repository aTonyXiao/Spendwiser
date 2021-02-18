import { appBackend } from './backend';

/**
 * 
 */
class Cards { 
    getCardInformation(cardId) {}

    async getCardName(cardId) {
        return new Promise((resolve, reject) => { 
            appBackend.dbGet("cards." + cardId, (data) => {
                if (typeof(data) == 'undefined') { 
                    console.log('card is not in database');
                    resolve(null);
                }
                resolve(data["name"]);
            })
        })
    }

    getCardRewards() {
    }

    addCardToDatabase(name, benefits, rewards, url) { 
        var date = new Date();
        return new Promise((resolve, reject) => { 
            appBackend.dbAdd("cards", { 
                name: name, 
                benefits: benefits,
                rewards: rewards, 
                url: url,
                dateAdded : date.toUTCString()
            }, (id) => {
                console.log('added card to database with id: ' + id);
                resolve(id);
            })
        })
    }
}

export var cards = new Cards();