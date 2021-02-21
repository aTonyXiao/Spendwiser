import React, { useState, useEffect } from 'react';
import { user } from '../../network/user';
import { cards } from '../../network/cards'

class RecommendCard {
    getCategory(googleCategory) {
        switch(googleCategory) {
            case "Bar":
            case "Cafe":
            case "Meal delivery":
            case "Meal takeaway":
            case "Restaurant":
                return "dining";
            case "Bakery":
            case "Liquor store":
            case "Supermarket":
            case "Grocery or supermarket":
                return "grocery";
            case "Drugstore":
                return "drugstore";
            default:
                return "others";
        }
    }

    async getRecCard(googleCategory, callback) {
        const userId = user.getUserId();
        let category = this.getCategory(googleCategory);
        let myCards = [];
        let tmpCardId = "";
        let tmpCardCatReward = null;
        // Get list of user's cards
        let dbCards = await user.getCards(userId);
        // For each card, get the category reward value
        let i = 0;
        console.log("google category: " + googleCategory);
        for (i = 0; i < dbCards.length; i++) {
            tmpCardId = dbCards[i].cardId;
            tmpCardCatReward = await cards.getCardReward(tmpCardId, category);
            myCards.push({"cardId": tmpCardId, "cardCatReward": tmpCardCatReward});
        }
        console.log(myCards);
        let res = Math.max.apply(Math, myCards.map(function(o){return o.cardCatReward;}))
        let recCard = myCards.find(function(o){ return o.cardCatReward == res; })
        let tmpCardImg = await cards.getCardImg(recCard.cardId);
        callback(recCard.cardId, tmpCardImg);
    }

    setTransaction(storeInfo, recCard, amountSpent) {
        const userId = user.getUserId();
        user.saveTransactionToUser(
            userId,
            recCard.recCardId,
            {storeName: storeInfo["label"],
                address: storeInfo["vicinity"],
                storeType: storeInfo["storeType"]
            },
            amountSpent
        );
    }
}

export var recommendCard = new RecommendCard();

