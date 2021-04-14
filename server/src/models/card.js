import mongoose from 'mongoose';

// card schema for the format of a card in the cards collection
const cardSchema = new mongoose.Schema({
    dateAdded: String,
    // cardId: String,
    name: String,
    image: String,
    url: String,
    rewardType: String,
    conversion: Number,
    benefits: [String],
    rewards: {
        type: Map,
        of: Number
    }
});

// methods for finding/querying
// ref: https://mongoosejs.com/docs/models.html

// TODO: refactor to include multiple databases
const cardModel = mongoose.model("card", cardSchema);

export default cardModel;