import React from 'react';
import { dining, grocery, drugstore, gas, homeImprovement, travel } from '../main/RecommendCard';
import { user } from '../../network/user';
import { cards } from '../../network/cards';

class SummaryHelper {
    matchTransactionToCategory(transaction) {
        let catIdx = null;
        if (dining.includes(transaction['storeInfo']['storeType'])) {
            catIdx = 0;
        } else if (grocery.includes(transaction['storeInfo']['storeType'])) {
            catIdx = 1;
        } else if (drugstore.includes(transaction['storeInfo']['storeType'])) {
            catIdx = 2;
        } else if (gas.includes(transaction['storeInfo']['storeType'])) {
            catIdx = 3;
        } else if (homeImprovement.includes(transaction['storeInfo']['storeType'])) {
            catIdx = 4;
        } else if (travel.includes(transaction['storeInfo']['storeType'])) {
            catIdx = 5;
        } else {
            catIdx = 6;
        }
        return catIdx;
    }

    async getDbCards(callback) {
        const userId = user.getUserId();
        let dbCards = await user.getCards(userId);
        let tmpCardId = "";
        let tmpCardName = "";
        let myCards = [];
        let i = 0;
        for (i = 0; i < dbCards.length; i++) {
            tmpCardId = dbCards[i].cardId;
            tmpCardName = await cards.getCardName(tmpCardId);
            myCards.push({
                "cardId": tmpCardId,
                "cardName": tmpCardName,
            });
        }
        callback(myCards);
    }

    getTimeFrame(curTimeframe) {
        let endTimeFrame, startTimeFrame;
        let month, date, year;
        [month, date, year] = new Date().toLocaleDateString("en-US").split("/");
        if (year.length == 2) {
            year = "20" + year;
        }
        endTimeFrame = new Date();
        switch (curTimeframe) {                
            case "Last month":
                endTimeFrame = new Date(month - 1 !== -1 ? year : year - 1, (month - 1) % 12, 0);
                startTimeFrame = new Date(month - 2 !== -1 ? year : year - 1, (month - 2) % 12);
                break;
            case "Last 3 months":
                startTimeFrame = new Date(month - 3 >= 0 ? year : year - 1, month - 3 % 12);
                break;
            case "Last 2 months":
                startTimeFrame = new Date(month - 2 !== -1 ? year : year - 1, (month - 2) % 12);
                break;
            default: 
                /* This Month */
                startTimeFrame = new Date(year, month - 1);
                break;
        }
        return [startTimeFrame, endTimeFrame];
    }
}

export var summaryHelper = new SummaryHelper();