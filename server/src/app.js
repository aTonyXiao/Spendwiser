import express from "express";

import Database from "./database.js";
import CardSchema from "./schemas/card.js";
import UserSchema from "./schemas/user.js";

// initialize express
const app = express();
app.use(express.json());

const db = new Database(app);
db.addModel("cards", CardSchema);
db.addModel("users", UserSchema);

// import fs from "fs";
// let raw = fs.readFileSync("firebase_dump.json");
// let data = JSON.parse(raw);
// db.loadData("cards", data);

export default app;