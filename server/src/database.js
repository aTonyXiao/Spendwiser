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
        
        // get all docs
        this.app.get(prefix + modelName, (req, res) => {
            newModel.find((err, data) => {
                if (err || data == null) res.sendStatus(500);
                else res.json(data);
            });
        })

        // get a specific doc by ID
        this.app.get(prefix + modelName + "/:id", (req, res) => {
            newModel.findById(req.params.id, (err, data) => {
                if (err || data == null) res.sendStatus(404);
                else res.json(data);
            });
        });

        // create doc request
        this.app.post(prefix + modelName, (req, res) => {
            let requestData = body;
            requestData.dateAdded = Date.now();
            newModel.create(requestData, (err, data) => {
                if (err || data == null) res.sendStatus(500);
                else res.send(data._id);
            });
        });

        // update doc request
        this.app.put(prefix + modelName + "/:id", (req, res) => {
            newModel.findByIdAndUpdate(req.params.id, body, (err, data) => {
                res.sendStatus(err || data == null ? 500 : 200);
            });
        });

        // delete doc request
        this.app.delete(prefix + modelName + "/:id", (req, res) => {
            newModel.findByIdAndDelete(req.params.id, (err, data) => {
                res.sendStatus(err || data == null ? 500 : 200);
            });
        });

        this.models.push(newModel);
    }

    createNewDatabase (dbName) {
        return new Database(this.app, dbName);
    }
}

export default Database;