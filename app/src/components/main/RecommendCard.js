import { user } from '../../network/user';
import { cards } from '../../network/cards'

export let dining = ['Bar', 'Cafe', 'Meal delivery', 'Meal takeaway', 'Restaurant', 'Dining'];
export let grocery = ['Bakery','Liquor Store', 'Supermarket', 'Grocery or supermarket', 'Grocery'];
export let drugstore = ['Drugstore', 'Pharmacy'];
export let gas = ['Gas station', 'Gas'];
export let homeImprovement = ['Furniture store', 'Home goods store', 'Electrician', 
    'Hardware store', 'Plumber', 'Roofing contractor', 'Home Improvement'];
export let travel = ['Airport', 'Amusement park', 'Aquarium', 'Art gallery', 'Car rental', 'Light rail station', 'Parking',
    'Tourist attraction', 'Transit station', 'Travel agency', 'Zoo', 'Travel'];

class RecommendCard {
    getCategory(googleCategory) {
        if (dining.includes(googleCategory)) {
            return "dining";
        } else if (grocery.includes(googleCategory)) {
            return 'grocery';
        } else if (drugstore.includes(googleCategory)) {
            return 'drugstore';
        } else if (gas.includes(googleCategory)) {
            return 'gas';
        } else if (homeImprovement.includes(googleCategory)) {
            return 'homeImprovement';
        } else if (travel.includes(googleCategory)) {
            return 'travel';
        } else {
            return 'others';
        }
    }

    // get user's cards ranked by category given
    async getRecCards(googleCategory, callback) {
        const userId = user.getUserId();
        let category = this.getCategory(googleCategory);
        let myCards = [];
        let tmpCardId = "";
        // Get list of user's cards
        let dbCards = await user.getCards(userId);
        // For each card, get the category reward value
        let i = 0;
        for (i = 0; i < dbCards.length; i++) {
            tmpCardId = dbCards[i].cardId;
            tmpCardInfo = await cards.getCardReward(tmpCardId, category);
            myCards.push({
                "docId": dbCards[i].docId,
                "cardId": tmpCardId,
                "cardCatReward": tmpCardInfo["reward"],
                "cardImg": tmpCardInfo["image"],
                "cardType": tmpCardInfo["type"],
                "cardName": tmpCardInfo["name"],
                "cardCatUncoverted": tmpCardInfo["unconvertedReward"]
            });
        }
        myCards.sort((a, b) => (a.cardCatReward < b.cardCatReward ? 1 : -1))
        callback(myCards);
    }
}

export var recommendCard = new RecommendCard();

