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

    // get user's cards ranked by category given
    async getRecCards(googleCategory, callback) {
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
            tmpCardInfo = await cards.getCardReward(tmpCardId, category);
            myCards.push({
                "cardId": tmpCardId,
                "cardCatReward": tmpCardInfo["reward"],
                "cardImg": tmpCardInfo["image"],
                "cardType": tmpCardInfo["type"],
                "cardCatUncoverted": tmpCardInfo["unconvertedReward"]
            });
        }
        myCards.sort((a, b) => (a.cardCatReward < b.cardCatReward ? 1 : -1))
        // console.log(myCards);
        callback(myCards);
    }

    // insert user's transaction into db
    setTransaction(storeInfo, recCard, amountSpent) {
        const userId = user.getUserId();
        user.saveTransactionToUser(
            userId,
            recCard.recCardId,
            {
                storeName: storeInfo["label"],
                address: storeInfo["vicinity"],
                storeType: storeInfo["storeType"]
            },
            amountSpent
        );
    }
}

export var recommendCard = new RecommendCard();

