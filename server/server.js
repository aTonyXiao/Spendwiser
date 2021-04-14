import express from 'express';
import mongoose from 'mongoose';

const port = 3000
const app = express();

// connection status
let response = "Not Connected";

// what's being sent to the user
app.get("/", (req, res) => {
    res.send(response);
});

// try to connect to mongo using mongoose
mongoose.connect("mongodb://mongo-db:27017/test", {useNewUrlParser: true, useUnifiedTopology: true}).then(() => {
    response = "Connected!";
}).catch((err) => {
    response = err;
});

// listen on the given port
app.listen(port, () => {
    console.log("Server listening for requests on port: " + port);
});