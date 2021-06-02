import { appBackend } from './backend';

/**
 * A Card class that performs database operations for cards
 */
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
                console.log('\n\n');
                console.log(data)

                if (typeof data != 'unidefined') {
                    let unconvertedReward = data.rewards[category];
                    if (isNaN(unconvertedReward)) {
                        unconvertedReward = data.rewards["others"];
                    }
                    let convertedReward = unconvertedReward * data.conversion;
                    let cardCatInfo = {
                        "reward": convertedReward,
                        "image": data.image,
                        "unconvertedReward": unconvertedReward,
                        "type": data.rewardType,
                        "name": data.name
                    }
                    resolve(cardCatInfo);
                }
                reject("data was undefined");
            })
        })
    }

    /**
     * Get a card image url based on its card id
     * @param {*} cardId - the card id
     */
    async getCardImageURL(cardId) {
        return new Promise((resolve, reject) => {
            appBackend.dbGet("cards." + cardId, (data) => {
                resolve(data.image);
            })
        });
    }

    /**
     * Get a card image based on its card id
     * @param {*} cardId - the card id
     */
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
    addCardToDatabase(name, benefits, rewardType, rewards, url) { 
        var date = new Date();
        return new Promise((resolve, reject) => { 
            appBackend.dbAdd("cards", { 
                name: name,
                image: "",
                benefits: benefits,
                rewardType: rewardType,
                conversion: 1,
                rewards: rewards, 
                url: url,
                dateAdded : date
            }, async (id) => {
                console.log('added card to database with id: ' + id);
                appBackend.dbSet("cards." + id, { // need to set the cardId as well
                    cardId: id
                }, true, () => {
                    resolve(id);
                });
            })
        })
    }


    /**
     * Adds JSON data with card data to the database
     * 
     * @param {JSON} json - the JSON data with the 'cards' element
     */
    addJsonToDatabase(json) {
        Object.entries(json.cards).forEach(([index, card]) => {
            let date = new Date();
            console.log(date.toUTCString());
            appBackend.dbAdd("cards", { 
                name: card.name, 
                image: card.image,
                benefits: card.benefits,
                rewardType: card.rewardType,
                rewards: card.rewards, 
                url: card.url,
                dateAdded : date
            }, (id) => {
                appBackend.dbSet("cards." + id, {
                    cardId: id
                }, true, () => {
                    console.log('added card to database with id: ' + id);
                });
            })
        });
    }

    /**
     * Gets all the card names in the database in mapping to card id
     * @param {function} callback - function to be invoked on resulting mapping
     * 
     * @returns {object} - mapping of card name to card id
     */
    getCardNames(callback) { 
        appBackend.dbGetSubCollectionsRemote("cards", (data) => { 
            var mapping = {};
            for (var i=0 ; i<data.length ; i++) { 
                var name = data[i]["name"];
                var id = data[i]["cardId"];

                mapping[name] = id;
            }
            callback(mapping);
        })
    }

    /**
     * Get the general card's data for a certain card id
     * @param {*} cardId - the card id
     * @param {*} callback - function that is invoked for the returned data (called for the card)
     */
    getCardData(cardId, callback) {
        appBackend.dbGetSubCollectionsRemote("cards", (data) => { 
            var mapping = {};
            for (var i=0 ; i<data.length ; i++) { 
                if (data[i]["cardId"] == cardId) {
                    return callback(data[i]);
                }
            }
            callback(null);
        })
    }
}

export var cards = new Cards();