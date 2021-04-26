import mongoose from "mongoose";

// this is a temporary hacky solution to fix user id issues
function fixID (id) {
    return id.length > 24 ? id.substring(0, 12) : id;
}

class Database {

    constructor (app, auth, name = "") {
        this.app = app;
        this.auth = auth;
        this.database = name.length == 0 ? mongoose : mongoose.useDb(name);
        this.name = name;
        this.models = [];
    }

    addModel (modelName, modelSchema) {
        let newModel = this.database.model(modelName, modelSchema);
        let prefix = this.name.length == 0 ? "/" : "/" + this.name + "/";
        
        this.addModelRequests(prefix, modelName, newModel);
        modelSchema.eachPath((name, type) => {
            if (type instanceof mongoose.Schema.Types.DocumentArray) {
                this.addSubdocRequests(prefix + modelName, newModel, name);
            }
        });
        this.models.push(newModel);
    }

    addModelRequests (prefix, modelName, model) {
        let uri = prefix + modelName;

        // get all docs :: scopes !== undefined ? scopes["read"] : undefined
        this.app.get(uri, this.auth, (req, res) => {
            model.find((err, data) => {
                if (err || data == null) res.sendStatus(500);
                else res.json(data);
            });
        })

        // get a specific doc by ID
        this.app.get(uri + "/:id", this.auth, (req, res) => {
            model.findById(fixID(req.params.id), (err, data) => {
                if (err || data == null) res.sendStatus(404);
                else res.json(data);
            });
        });

        // create doc request
        this.app.post(uri, (req, res) => {
            let requestData = req.body;
            if (model.schema.pathType("dateAdded") !== "adhocOrUndefined") requestData.dateAdded = (new Date()).toUTCString();
            model.create(requestData, (err, data) => {
                if (err || data == null) res.sendStatus(500);
                else res.send(data._id);
            });
        });

        // update doc request
        this.app.put(uri + "/:id", (req, res) => {
            model.findByIdAndUpdate(fixID(req.params.id), req.body, {"upsert": true, "new": true, "setDefaultsOnInsert": true}, (err, data) => {
                res.sendStatus(err || data == null ? 500 : 200);
            });
        });

        // delete doc request
        this.app.delete(uri + "/:id", (req, res) => {
            model.findByIdAndDelete(fixID(req.params.id), (err, data) => {
                res.sendStatus(err || data == null ? 500 : 200);
            });
        });
    }

    addSubdocRequests (uri, model, subdoc) {
        // get all subdocs
        this.app.get(uri + "/:id/" + subdoc, (req, res) => {
            model.findById(fixID(req.params.id), (err, data) => {
                if (err || data == null) res.sendStatus(500);
                else res.json(data.get(subdoc));
            });
        })

        // get a specific doc by ID
        this.app.get(uri + "/:id/" + subdoc + "/:id2", (req, res) => {
            model.findById(fixID(req.params.id), (err, data) => {
                if (err || data == null) res.sendStatus(404);
                else {
                    let currSubdoc = data.get(subdoc).id(fixID(req.params.id2));
                    if (currSubdoc == null) res.sendStatus(404);
                    else res.json(currSubdoc);
                }
            });
        });

        // create doc request
        this.app.post(uri + "/:id/" + subdoc, (req, res) => {
            model.findById(fixID(req.params.id), (err, data) => {
                if (err || data == null) res.sendStatus(500);
                else {
                    let requestData = req.body;
                    if (model.schema.pathType(subdoc + ".dateAdded") !== "adhocOrUndefined") requestData.dateAdded = (new Date()).toUTCString();
                    let newSubdoc = data.get(subdoc).create(requestData);
                    data.get(subdoc).push(newSubdoc);
                    data.save((err) => {
                        if (err) res.sendStatus(500);
                        else res.send(newSubdoc._id);
                    });
                }
            });
        });

        // update doc request
        this.app.put(uri + "/:id/" + subdoc + "/:id2", (req, res) => {
            let prefix = subdoc + ".$.";
            let requestData = {};
            for (const [key, obj] of Object.entries(req.body)) {
                requestData[prefix + key] = obj;
            }
            let filter = subdoc + "._id";
            model.findOneAndUpdate({"_id": fixID(req.params.id), [filter]: fixID(req.params.id2)}, {"$set": requestData}, (err, data) => {
                res.sendStatus(err || data == null ? 500 : 200);
            });
        });

        // delete doc request
        this.app.delete(uri + "/:id/" + subdoc + "/:id2", (req, res) => {
            let requestData = {[subdoc]: {"_id": fixID(req.params.id2)}};
            let filter = subdoc + "._id";
            model.findOneAndUpdate({"_id": fixID(req.params.id), [filter]: fixID(req.params.id2)}, {"$pull": requestData}, (err, data) => {
                res.sendStatus(err || data == null ? 500 : 200);
            });
        });
    }

    loadData (model, data) {
        let collection = this.database.model(model);
        data.cards.forEach((obj) => {
            let requestData = obj;
            requestData.dateAdded = (new Date()).toUTCString();
            collection.create(requestData, (err, resp) => {
                collection.findByIdAndUpdate(resp._id, {cardId: resp._id.toString()}, (err, data) => console.log("added: " + data._id));
            });
        });
    }

    createNewDatabase (dbName) {
        return new Database(this.app, dbName);
    }
}

export default Database;