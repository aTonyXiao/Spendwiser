import express from 'express';

import cardModel from "./models/card.js";

// initialize express
const app = express();

// set up the routes
app.get("/set_data", async (req, res) => {
    const testCard = new cardModel();
    await testCard.save();
    res.send("Success!");
});

app.get("/get_data", async (req, res) => {
    const data = await cardModel.find();
    res.json(data);
});

export default app;