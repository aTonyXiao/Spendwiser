import dotenv from "dotenv";
import express from "express";
import jwt from "express-jwt";
import jwtAuthz from "express-jwt-authz";
import jwksRsa from "jwks-rsa";

import Database from "./database.js";
import CardSchema from "./schemas/card.js";
import UserSchema from "./schemas/user.js";

// load environment constants
dotenv.config();

// initialize express
const app = express();
app.use(express.json());

// Authorization middleware. When used, the
// Access Token must exist and be verified against
// the Auth0 JSON Web Key Set
const checkJwt = jwt({
    // Dynamically provide a signing key
    // based on the kid in the header and 
    // the signing keys provided by the JWKS endpoint.
    secret: jwksRsa.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: process.env.AUTH0_DOMAIN + ".well-known/jwks.json"
    }),
  
    // Validate the audience and the issuer.
    audience: process.env.AUTH0_CLIENT_ID,
    issuer: [process.env.AUTH0_DOMAIN],
    algorithms: ['RS256']
});

const db = new Database(app, checkJwt);
db.addModel("cards", {"cards": {"read": jwtAuthz(["read:card"])}}, CardSchema);
db.addModel("users", undefined, UserSchema);

// import fs from "fs";
// let raw = fs.readFileSync("firebase_dump.json");
// let data = JSON.parse(raw);
// db.loadData("cards", data);

export default app;