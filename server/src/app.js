import express from "express";
import helmet from "helmet";

// for loading
import fs from "fs";

import Database from "./database.js";
import CardSchema from "./schemas/card.js";
import UserSchema from "./schemas/user.js";

// middlewares for authentication
import auth0 from "./auth/auth0.js";
import firebase from "./auth/firebase.js";

// initialize express
const app = express();
app.use(express.json()); // use express JSON decoding
app.use(helmet()); // use helmet middlewares for enhanced security

// create the database with firebase authentication middleware
const db = new Database(app, firebase);
db.addModel("cards", CardSchema);
db.addModel("users", UserSchema);

// import data from the firebase dump
if (typeof process.env.LOAD_FILE !== "undefined" && process.env.LOAD_FILE !== "false") {
    let raw = fs.readFileSync(process.env.LOAD_FILE);
    let data = JSON.parse(raw);
    db.loadData("cards", data);
}

export default app;