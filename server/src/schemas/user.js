import mongoose from "mongoose";

// card schema for the format of a card in the cards collection

const UserCardSchema = new mongoose.Schema({
    cardId: {type: String, default: ""},
    diff: {type: String, default: ""}
});

const UserTransactionSchema = new mongoose.Schema({
    dateAdded: {type: Date, default: Date.now()},
    cardId: {type: String, default: ""},
    amountSpent: {type: String, default: ""},
    rewards: {type: Map, of: Number, default: {}},
});

const UserSchema = new mongoose.Schema({
    dateAdded: {type: Date, default: Date.now()},
    cards: [UserCardSchema],
    transactions: [UserTransactionSchema]
});

export default UserSchema;