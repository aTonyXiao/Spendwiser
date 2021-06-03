/** The schema for the structure of the Users collection
 * @module UserSchema */

import mongoose from "mongoose";

/**
 * Schema for the user's cards
 */
const UserCardSchema = new mongoose.Schema({
    cardId: {type: String, default: ""},
    diff: {type: String, default: ""}
});

/**
 * Schema for the user's transactions
 */
const UserTransactionSchema = new mongoose.Schema({
    dateAdded: {type: Date, default: Date.now()},
    cardId: {type: String, default: ""},
    docId: {type: String, default: ""},
    amountSpent: {type: String, default: ""},
    storeInfo: {type: Object, default: {}},
    meta_synced: {type: Boolean, default: false},
    meta_modified: {type: Date, default: Date.now()}
});

/**
 * Schema for the user model
 */
const UserSchema = new mongoose.Schema({
    dateAdded: {type: String, default: ""},
    cards: [UserCardSchema],
    transactions: [UserTransactionSchema]
});

export default UserSchema;