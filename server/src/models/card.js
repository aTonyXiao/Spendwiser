import mongoose from "mongoose";

// card schema for the format of a card in the cards collection
const cardSchema = new mongoose.Schema({
    dateAdded: {type: Date, default: Date.now()},
    name: {type: String, default: ""},
    image: {type: String, default: ""},
    url: {type: String, default: ""},
    rewardType: {type: String, default: ""},
    conversion: {type: Number, default: 0},
    benefits: {type: [String], default: []},
    rewards: {type: Map, of: Number, default: {}}
});

// methods for finding/querying
// ref: https://mongoosejs.com/docs/models.html

// TODO: refactor to include multiple databases
const cardModel = mongoose.model("card", cardSchema);

export default cardModel;