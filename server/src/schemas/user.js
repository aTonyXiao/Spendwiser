import mongoose from "mongoose";

// card schema for the format of a card in the cards collection

const UserCardSchema = new mongoose.Schema({
    cardId: {type: String, default: ""},
    diff: {type: String, default: ""}
});

const UserTransactionSchema = new mongoose.Schema({
    dateAdded: {type: String, default: ""},
    cardId: {type: String, default: ""},
    amountSpent: {type: String, default: ""},
    rewards: {type: [], default: []},
});

const UserSchema = new mongoose.Schema({
    dateAdded: {type: String, default: ""},
    cards: [UserCardSchema],
    transactions: [UserTransactionSchema]
});

export default UserSchema;