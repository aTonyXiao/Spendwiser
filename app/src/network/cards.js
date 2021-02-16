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

    getCardRewards(cardId) { 
        // TODO
    }
}

export var cards = new Cards();