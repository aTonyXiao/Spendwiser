import mongoose from "mongoose";

// card schema for the format of a card in the cards collection
const CardSchema = new mongoose.Schema({
    dateAdded: {type: String, default: ""},
    name: {type: String, default: ""},
    cardId: {type: String, default: ""},
    image: {type: String, default: ""},
    url: {type: String, default: ""},
    rewardType: {type: String, default: ""},
    conversion: {type: Number, default: 0},
    benefits: {type: [String], default: []},
    rewards: {type: [], default: []},
});

export default CardSchema;