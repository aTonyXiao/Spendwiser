import express from "express";
import helmet from "helmet";

import Database from "./database.js";
import CardSchema from "./schemas/card.js";
import UserSchema from "./schemas/user.js";

// middlewares for authentication
import auth0 from "./auth/auth0.js";
import firebase from "./auth/firebase.js";

// initialize express
const app = express();
app.use(express.json());
app.use(helmet());

// create the database with firebase authentication middleware
const db = new Database(app, firebase);
db.addModel("cards", CardSchema);
db.addModel("users", UserSchema);

// uncomment and run once to import data from the firebase dump
// import fs from "fs";
// let raw = fs.readFileSync("firebase_dump.json");
// let data = JSON.parse(raw);
// db.loadData("cards", data);

export default app;