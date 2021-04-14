import mongoose from 'mongoose';

const cardSchema = new mongoose.Schema({
    dateAdded: String,
    cardId: String,
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

const cardModel = mongoose.model("card", cardSchema);

export default cardModel;