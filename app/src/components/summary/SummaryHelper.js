import React from 'react';
import { dining, grocery, drugstore, gas, homeImprovement, travel } from '../main/RecommendCard';

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
}

export var summaryHelper = new SummaryHelper();