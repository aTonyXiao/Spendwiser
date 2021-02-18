import React, { useState, useEffect } from 'react';
import { user } from '../../network/user';
import { cards } from '../../network/cards'

function getCategory(googleCategory) {
    switch(googleCategory) {
        case "bar":
        case "cafe":
        case "meal delivery":
        case "meal takeaway":
        case "restaurant":
            return "dining";
        case "bakery":
        case "liqour store":
        case "supermarket":
        case "grocery or supermarket":
            return "grocery";
        default:
            return "others";
    }
}

export async function RecommendedCard(googleCategory, callback) {
    const userId = user.getUserId();
    let category = getCategory(googleCategory);
    let myCards = [];
    let tmpCardId = "";
    let tmpCardCatReward = null;
    // Get list of user's cards
    let dbCards = await user.getCards(userId);
    // For each card, get the category reward value
    let i = 0;
    for (i = 0; i < dbCards.length; i++) {
        tmpCardId = dbCards[i].cardId;
        tmpCardCatReward = await cards.getCardReward(tmpCardId, category)
        myCards.push({"cardId": tmpCardId, "cardCatReward": tmpCardCatReward});
    }
    let res = Math.max.apply(Math, myCards.map(function(o){return o.cardCatReward;}))
    let recCard = myCards.find(function(o){ return o.cardCatReward == res; })
    callback(recCard.cardId);
}
