import express from "express";

import cardModel from "./models/card.js";

// initialize express
const app = express();
app.use(express.json());

// get all cards
app.get("/cards", async (req, res) => {
    cardModel.find((err, data) => {
        res.json(data);
    });
});

// get a specific card by ID
app.get("/cards/:cardId", async (req, res) => {
    cardModel.findById(req.params.cardId, (err, data) => {
        res.json(data);
    });
});

// create card request
app.post("/cards", async (req, res) => {
    cardModel.create(req.body, (err, card) => {
        res.send(err ? "error" : card._id);
    });
});

// update card request
app.put("/cards/:cardId", async (req, res) => {
    cardModel.findByIdAndUpdate(req.params.cardId, req.body, (err, card) => {
        res.send(err ? "error" : "success");
    });
});

// delete card request
app.delete("/cards/:cardId", async (req, res) => {
    cardModel.findByIdAndDelete(req.params.cardId, (err, card) => {
        res.send(err ? "error" : "success");
    });
});

export default app;