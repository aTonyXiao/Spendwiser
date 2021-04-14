import express from 'express';
import mongoose from 'mongoose';

const port = 3000
const app = express();

// try to connect to mongo using mongoose
// TODO: refactor into multiple db and use its own module so mongoose isn't utilized in this file
// ^https://github.com/Automattic/mongoose/wiki/3.8-Release-Notes#connection-pool-sharing
mongoose.connect("mongodb://mongo-db:27017/test", {useNewUrlParser: true, useUnifiedTopology: true}).then(() => {

    app.get("/get_data", (req, res) => {
        // TODO: get requests
    });

    // listen on the given port
    app.listen(port, () => {
        console.log("Server listening for requests on port: " + port);
    });
}).catch((err) => {
    console.log(err);
});

