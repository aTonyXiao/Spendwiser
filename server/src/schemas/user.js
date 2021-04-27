import mongoose from "mongoose";

// card schema for the format of a card in the cards collection

const UserCardSchema = new mongoose.Schema({
    cardId: {type: String, default: ""},
    diff: {type: String, default: ""}
});

const UserTransactionSchema = new mongoose.Schema({
    dateAdded: {type: Date, default: Date.now()},
    cardId: {type: String, default: ""},
    docId: {type: String, default: ""},
    amountSpent: {type: String, default: ""},
    storeInfo: {type: Object, default: {}},
    meta_synced: {type: Boolean, default: false},
    meta_modified: {type: Date, default: Date.now()}
});

const UserSchema = new mongoose.Schema({
    dateAdded: {type: String, default: ""},
    cards: [UserCardSchema],
    transactions: [UserTransactionSchema]
});

export default UserSchema;