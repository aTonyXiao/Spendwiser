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

export default app;