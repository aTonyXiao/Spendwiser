import express from "express";

import Database from "./database.js";
import CardSchema from "./schemas/card.js";

// initialize express
const app = express();
app.use(express.json());

const db = new Database(app);
db.addModel("card", CardSchema);

export default app;