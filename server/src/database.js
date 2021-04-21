import mongoose from "mongoose";

class Database {

    constructor (app, name = "") {
        this.app = app;
        this.database = name.length == 0 ? mongoose : mongoose.useDb(name);
        this.name = name;
        this.models = [];
    }

    addModel (modelName, modelSchema) {
        let newModel = this.database.model(modelName, modelSchema);
        let prefix = this.name.length == 0 ? "/" : "/" + this.name + "/";
        
        this.addModelRequests(prefix + modelName, newModel);
        modelSchema.eachPath((name, type) => {
            if (type instanceof mongoose.Schema.Types.DocumentArray) {
                this.addSubdocRequests(prefix + modelName, newModel, name);
            }
        });
        this.models.push(newModel);
    }

    addModelRequests (uri, model) {
        // get all docs
        this.app.get(uri, (req, res) => {
            model.find((err, data) => {
                if (err || data == null) res.sendStatus(500);
                else res.json(data);
            });
        })

        // get a specific doc by ID
        this.app.get(uri + "/:id", (req, res) => {
            model.findById(req.params.id, (err, data) => {
                if (err || data == null) res.sendStatus(404);
                else res.json(data);
            });
        });

        // create doc request
        this.app.post(uri, (req, res) => {
            let requestData = req.body;
            if (model.schema.pathType("dateAdded") !== "adhocOrUndefined") requestData.dateAdded = Date.now();
            model.create(requestData, (err, data) => {
                if (err || data == null) res.sendStatus(500);
                else res.send(data._id);
            });
        });

        // update doc request
        this.app.put(uri + "/:id", (req, res) => {
            model.findByIdAndUpdate(req.params.id, req.body, (err, data) => {
                res.sendStatus(err || data == null ? 500 : 200);
            });
        });

        // delete doc request
        this.app.delete(uri + "/:id", (req, res) => {
            model.findByIdAndDelete(req.params.id, (err, data) => {
                res.sendStatus(err || data == null ? 500 : 200);
            });
        });
    }

    addSubdocRequests (uri, model, subdoc) {
        // get all subdocs
        this.app.get(uri + "/:id/" + subdoc, (req, res) => {
            model.findById(req.params.id, (err, data) => {
                if (err || data == null) res.sendStatus(500);
                else res.json(data.get(subdoc));
            });
        })

        // get a specific doc by ID
        this.app.get(uri + "/:id/" + subdoc + "/:id2", (req, res) => {
            model.findById(req.params.id, (err, data) => {
                if (err || data == null) res.sendStatus(404);
                else {
                    let currSubdoc = data.get(subdoc).id(req.params.id2);
                    if (currSubdoc == null) res.sendStatus(404);
                    else res.json(currSubdoc);
                }
            });
        });

        // create doc request
        this.app.post(uri + "/:id/" + subdoc, (req, res) => {
            model.findById(req.params.id, (err, data) => {
                if (err || data == null) res.sendStatus(500);
                else {
                    let requestData = req.body;
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
            model.findOneAndUpdate({"_id": req.params.id, [filter]: req.params.id2}, {"$set": requestData}, (err, data) => {
                res.sendStatus(err || data == null ? 500 : 200);
            });
        });

        // delete doc request
        this.app.delete(uri + "/:id/" + subdoc + "/:id2", (req, res) => {
            let requestData = {[subdoc]: {"_id": req.params.id2}};
            let filter = subdoc + "._id";
            model.findOneAndUpdate({"_id": req.params.id, [filter]: req.params.id2}, {"$pull": requestData}, (err, data) => {
                res.sendStatus(err || data == null ? 500 : 200);
            });
        });
    }

    createNewDatabase (dbName) {
        return new Database(this.app, dbName);
    }
}

export default Database;