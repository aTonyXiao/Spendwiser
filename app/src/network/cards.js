import { appBackend } from './backend';

class Cards { 
    /**
     * Gets the name of a card
     * @param {string} cardId 
     */
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

    /**
     * Gets the card reward of a card for a specific category
     * @param {string} cardId - the cards id
     * @param {string} category - the category to get a reward foe
     */
    async getCardReward(cardId, category) {
        return new Promise((resolve, reject) => { 
            appBackend.dbGet("cards." + cardId, (data) => {
                let unconvertedReward = data.rewards[category];
                if (isNaN(unconvertedReward)) {
                    unconvertedReward = data.rewards["others"];
                }
                let convertedReward = unconvertedReward * data.conversion;
                let cardCatInfo = {
                    "reward": convertedReward,
                    "image": data.image,
                    "unconvertedReward": unconvertedReward,
                    "type": data.rewardType
                }
                resolve(cardCatInfo);
            })
        })
    }

    async getCardImageURL(cardId) {
        return new Promise((resolve, reject) => {
            appBackend.dbGet("cards." + cardId, (data) => {
                resolve(data.image);
            })
        });
    }

    async getCardImg(cardId) {
        return new Promise((resolve, reject) => { 
            appBackend.dbGet("cards." + cardId, (data) => {
                resolve(data.image);
            })
        })
    }

    /**
     * Adds a card to the the cards database
     * @param {string} name - card name
     * @param {*} benefits 
     * @param {*} rewards 
     * @param {string} url - card url
     */
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

    /**
     * Gets all the card names in the database in mapping to card id
     * @param {function} callback - function to be invoked on resulting mapping
     * 
     * @returns {object} - mapping of card name to card id
     */
    getCardNames(callback) { 
        appBackend.dbGetSubCollections("cards", (data) => { 
            var mapping = {};
            for (var i=0 ; i<data.length ; i++) { 
                var name = data[i]["name"];
                var id = data[i]["cardId"];

                mapping[name] = id;
            }
            callback(mapping);
        })
    }
}

export var cards = new Cards();