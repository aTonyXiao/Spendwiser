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

    async getCardImageURL(cardId) {
        return new Promise((resolve, reject) => {
            appBackend.dbGet("cards." + cardId, (data) => {
                resolve(data.image);
            })
        });
    }

    getCardRewards(cardId) { 
        // TODO
    }
}

export var cards = new Cards();