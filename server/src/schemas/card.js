/** @module CardSchema The schema for the structure of the Cards collection */

import mongoose from "mongoose";

/**
 * Schema for the Card model
 */
const CardSchema = new mongoose.Schema({
    dateAdded: {type: String, default: ""},
    name: {type: String, default: ""},
    cardId: {type: String, default: ""},
    image: {type: String, default: ""},
    url: {type: String, default: ""},
    rewardType: {type: String, default: ""},
    conversion: {type: Number, default: 0},
    benefits: {type: [String], default: []},
    rewards: {type: Map, of: Number, default: {}},
});

export default CardSchema;