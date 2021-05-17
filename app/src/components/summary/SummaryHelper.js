import React from 'react';
import { dining, grocery, drugstore, gas, homeImprovement, travel } from '../main/RecommendCard';
import { user } from '../../network/user';
import { cards } from '../../network/cards';

class SummaryHelper {
    /**
     * Gets the category of the transaction from the store type as retrieved from database.
     * @param {object} transaction - transaction to categorize
     */
    matchTransactionToCategory(transaction) {
        // console.log("arghhh");
        // console.log(transaction);
        // console.log(transaction['storeInfo']);
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

    /**
     * Gets the user's cards from database and accumulate them into an array
     * @param {function} callback - a callback function to handle the user cards array
     */
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

    /**
     * Gets the start and end timeframes used to query databse for transactions
     * @param {string} curTimeframe - a string to denote which timeframe to be used
     */
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
                endTimeFrame = new Date(year, month - 1, 0, 23, 59, 59, 59);
                startTimeFrame = new Date(year, month - 2);
                break;
            case "Last 3 months":
                startTimeFrame = new Date(year, month - 3);
                break;
            case "Last 2 months":
                startTimeFrame = new Date(year, month - 2);
                break;
            default: 
                /* This Month */
                startTimeFrame = new Date(year, month - 1);
                break;
        }
        console.log(startTimeFrame + " " + endTimeFrame);
        return [startTimeFrame, endTimeFrame];
    }
}

export var summaryHelper = new SummaryHelper();