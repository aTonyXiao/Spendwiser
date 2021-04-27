import mongoose from "mongoose";

import "./src/config.js"; // weirdness with ES6 imports, so it's own module
import app from "./src/app.js";

// some server constants
const mongo_url = "mongodb://mongo-db:27017/" + process.env.MONGO_DEFAULT_DB;
const port = 3000;

// try to connect to mongo using mongoose
// TODO: refactor into multiple db and use its own module so mongoose isn't utilized in this file
// ^https://github.com/Automattic/mongoose/wiki/3.8-Release-Notes#connection-pool-sharing
mongoose.connect(mongo_url, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false}).then(() => {
    // listen on the given port
    app.listen(port, () => {
        console.log("Server listening for requests on port: " + port);
    });
}).catch((err) => {
    console.log(err);
});