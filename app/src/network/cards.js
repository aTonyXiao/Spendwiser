import { appBackend } from './backend';

/**
 * 
 */
class Cards { 
    getCardInformation(cardId) {}

    async getCardName(cardId) {
        return new Promise((resolve, reject) => { 
            appBackend.dbGet("cards." + cardId, (data) => {
                resolve(data.name);
            })
        })
    }

    async getCardReward(cardId, category) {
        return new Promise((resolve, reject) => { 
            appBackend.dbGet("cards." + cardId, (data) => {
                let convertedReward = data.rewards[category] * data.conversion;
                if (isNaN(convertedReward)) {
                    convertedReward = data.rewards["others"] * data.conversion;
                }
                resolve(convertedReward);
            })
        })
    }


    async getCardImg(cardId) {
        return new Promise((resolve, reject) => { 
            appBackend.dbGet("cards." + cardId, (data) => {
                resolve(data.image);
            })
        })
    }

    addCard(name, rewards, url) { 
        return new Promise((resolve, reject) => { 
            appBackend.dbAdd("cards", { 
                name: name, 
                rewards: rewards, 
                url: url
            }, (id) => {
                console.log('added card to database with id: ' + id);
                resolve(id);
            })
        })
    }
}

export var cards = new Cards();