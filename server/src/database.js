import mongoose from "mongoose";

const query_operators = {"<": (req, query) => {
                            return req.where(query[0]).lt(query[1]);
                        }, "<=": (req, query) => {
                            return req.where(query[0]).lte(query[1]);
                        }, "==": (req, query) => {
                            return req.where(query[0]).equals(query[1]);
                        }, ">=": (req, query) => {
                            return req.where(query[0]).gte(query[1]);
                        }, ">": (req, query) => {
                            return req.where(query[0]).gt(query[1]);
                        }, "!=": (req, query) => {
                            return req.where(query[0]).ne(query[1]);
                        }};
const query_operators_list = Object.keys(query_operators);

// this is a temporary hacky solution to fix user id issues
// the issue is that firebase User IDs are encoded as 28 characters long
// mongoDB only accepts 12 char strings or 24 char hex codes as IDs unfortunately 
function fixID (id) {
    return id.length > 24 ? id.substring(0, 12) : id;
}

/**
 * Class that wraps mongoose models and HTTP requests
 */
class Database {

    /**
     * Database constructor that takes in the express app, middleware, and name
     * 
     * @param {*} app The express app reference
     * @param {*} auth The authentication middleware for HTTP requests
     * @param {String} name The name of the database (default db has none)
     */
    constructor (app, auth, name = "") {
        this.app = app;
        this.auth = auth;
        // if default, use default mongoose db, if not then branch out
        this.database = name.length == 0 ? mongoose : mongoose.useDb(name);
        this.name = name;
        this.models = [];
    }

    /**
     * Adds the mongoose model to this database for a given schema. Adds neccessary HTTP requests for CRUD
     * 
     * @param {*} modelName The name of the model
     * @param {*} modelSchema The mongoose schema of the model
     */
    addModel (modelName, modelSchema) {
        // create the model
        let newModel = this.database.model(modelName, modelSchema);
        // the prefix for the http requests depending
        let prefix = this.name.length == 0 ? "/" : "/" + this.name + "/";
        
        // add the HTTP requests for the model
        this.addModelRequests(prefix, modelName, newModel);

        // find all the sub collections/models and add requests for those too
        modelSchema.eachPath((name, type) => {
            if (type instanceof mongoose.Schema.Types.DocumentArray) {
                this.addSubdocRequests(prefix + modelName, newModel, name);
            }
        });

        // add the model to the list
        this.models.push(newModel);
    }

    // add the requests for a given model
    addModelRequests (prefix, modelName, model) {
        // the uri for this model
        let uri = prefix + modelName;

        // get all docs request
        this.app.get(uri, this.auth, (req, res) => {
            if (Object.keys(req.query).length == 0) {
                // mongoose: find all for the given model
                model.find((err, data) => {
                    if (err || data == null) res.sendStatus(500); // server err
                    else res.json(data); // send the data
                });
            } else if (Object.keys(req.query).length == 1 && typeof req.query.where !== "undefined") {
                let rawQuery = [], query = [], operators = [];
                if (!Array.isArray(req.query.where)) rawQuery.push(req.query.where);
                else rawQuery = req.query.where;
                for (let i = 0; i < rawQuery.length; i++) {
                    for (let j = 0; j < query_operators_list.length; j++) {
                        query[i] = rawQuery[i].split(query_operators_list[j]);
                        if (query[i].length == 2) {
                            operators[i] = query_operators_list[j];
                            break;
                        }
                        if (j == query_operators_list.length - 1) {
                            res.sendStatus(400);
                            return;
                        }
                    }
                }
                let dbRequest = model.find();
                for (let i = 0; i < query.length; i++) {
                    dbRequest = query_operators[operators[i]](dbRequest, query[i]);
                }
                dbRequest.exec((err, data) => {
                    if (err || data == null) res.sendStatus(500); // server err
                    else res.json(data); // send the data
                });
            } else {
                res.sendStatus(400);
            }
        })

        // get a specific doc by ID
        this.app.get(uri + "/:id", this.auth, (req, res) => {
            // mongoose: find by id
            model.findById(fixID(req.params.id), (err, data) => {
                if (err || data == null) res.sendStatus(404); // not found
                else res.json(data); // send the data
            });
        });

        // create doc request
        this.app.post(uri, this.auth, (req, res) => {
            let requestData = req.body;
            // check if it has a dateAdded value in the schema, if not given then add it to the values to save
            if (model.schema.pathType("dateAdded") !== "adhocOrUndefined" && !req.body.hasOwnProperty("dateAdded")) requestData.dateAdded = (new Date()).toUTCString();
            // mongoose: create a document
            model.create(requestData, (err, data) => {
                if (err || data == null) res.sendStatus(500); // server error
                else res.send(data._id); // send the id
            });
        });

        // update doc request
        this.app.put(uri + "/:id", this.auth, (req, res) => {
            // mongoose: find by id and update the documents, if not exist (upsert) and add the new doc
            model.findByIdAndUpdate(fixID(req.params.id), req.body, {"upsert": true, "new": true, "setDefaultsOnInsert": true}, (err, data) => {
                res.sendStatus(err || data == null ? 500 : 200);
            });
        });

        // delete doc request
        this.app.delete(uri + "/:id", this.auth, (req, res) => {
            // mongoose: find by id and delete 
            model.findByIdAndDelete(fixID(req.params.id), (err, data) => {
                res.sendStatus(err || data == null ? 500 : 200);
            });
        });
    }

    // add the requests for subdocuments
    addSubdocRequests (uri, model, subdoc) {
        // get all subdocs
        this.app.get(uri + "/:id/" + subdoc, this.auth, (req, res) => {
            if (Object.keys(req.query).length == 0) {
                // mongoose: find the given id parent document by id
                model.findById(fixID(req.params.id), (err, data) => {
                    if (err || data == null) res.sendStatus(500); // parent doc does not exist
                    else res.json(data.get(subdoc)); // then return the subdocuments
                });
            } else if (Object.keys(req.query).length == 1 && typeof req.query.where !== "undefined") {
                let rawQuery = [], query = [], operators = [];
                if (!Array.isArray(req.query.where)) rawQuery.push(req.query.where);
                else rawQuery = req.query.where;
                for (let i = 0; i < rawQuery.length; i++) {
                    for (let j = 0; j < query_operators_list.length; j++) {
                        query[i] = rawQuery[i].split(query_operators_list[j]);
                        if (query[i].length == 2) {
                            operators[i] = query_operators_list[j];
                            break;
                        }
                        if (j == query_operators_list.length - 1) {
                            res.sendStatus(400);
                            return;
                        }
                    }
                }
                let dbRequest = model.findById(fixID(req.params.id));
                let selectQuery = new mongoose.Query();
                selectQuery = selectQuery.elemMatch(subdoc, (elem) => {
                    for (let i = 0; i < query.length; i++) {
                        query_operators[operators[i]](elem, query[i]);
                    }
                });
                dbRequest = dbRequest.select(selectQuery.getQuery());
                console.log(selectQuery.getQuery());
                dbRequest.exec((err, data) => {
                    if (err || data == null) res.sendStatus(500); // server err
                    else res.json(data.get(subdoc)); // send the data
                    console.log(data);
                    console.log(typeof data);
                });
            } else {
                res.sendStatus(400);
            }
        })

        // get a specific doc by ID
        this.app.get(uri + "/:id/" + subdoc + "/:id2", this.auth, (req, res) => {
            // mongoose: find the parent document by id
            model.findById(fixID(req.params.id), (err, data) => {
                if (err || data == null) res.sendStatus(404); // the parent doc does not exist
                else {
                    // get the subdocument by id
                    let currSubdoc = data.get(subdoc).id(fixID(req.params.id2));
                    if (currSubdoc == null) res.sendStatus(404); // subdoc does not exist
                    else res.json(currSubdoc); // send the data
                }
            });
        });

        // create doc request
        this.app.post(uri + "/:id/" + subdoc, this.auth, (req, res) => {
            // mongoose: find the parent document by id
            model.findById(fixID(req.params.id), (err, data) => {
                if (err || data == null) res.sendStatus(500); // parent doc does not exisst
                else {
                    let requestData = req.body;
                    // check if it has a dateAdded value in the schema, if not given then add it to the values to save
                    if (model.schema.pathType(subdoc + ".dateAdded") !== "adhocOrUndefined" && !req.body.hasOwnProperty("dateAdded")) requestData.dateAdded = (new Date()).toUTCString();
                    // create a new subdocument
                    let newSubdoc = data.get(subdoc).create(requestData);
                    data.get(subdoc).push(newSubdoc);  // add that subdoc to the subdoc array
                    // try and save the parent document
                    data.save((err) => {
                        if (err) res.sendStatus(500);
                        else res.send(newSubdoc._id);
                    });
                }
            });
        });

        // update doc request
        this.app.put(uri + "/:id/" + subdoc + "/:id2", this.auth, (req, res) => {
            let prefix = subdoc + ".$.";
            let requestData = {};
            // make sure mongo sets the right subdocument from the array using dot notation 
            // $ is the found document array id
            for (const [key, obj] of Object.entries(req.body)) {
                requestData[prefix + key] = obj;
            }
            let filter = subdoc + "._id"; // what to match in subdocs
            // mongoose: find by the parent ID and match by a given subdoc's id, try to set that documents data
            model.findOneAndUpdate({"_id": fixID(req.params.id), [filter]: fixID(req.params.id2)}, {"$set": requestData}, (err, data) => {
                res.sendStatus(err || data == null ? 500 : 200);
            });
        });

        // delete doc request
        this.app.delete(uri + "/:id/" + subdoc + "/:id2", this.auth, (req, res) => {
            // for the subdocument array, try and pull the document of a certain id
            let requestData = {[subdoc]: {"_id": fixID(req.params.id2)}};
            let filter = subdoc + "._id";
            // mongoose: find by parent ID and try and pull the subdocument from the subdoc array for a given array
            model.findOneAndUpdate({"_id": fixID(req.params.id), [filter]: fixID(req.params.id2)}, {"$pull": requestData}, (err, data) => {
                res.sendStatus(err || data == null ? 500 : 200);
            });
        });
    }

    /**
     * For a given model, load the given data into the database (relies on the firebase_dump structure with cards)
     * 
     * @param {*} model Model to create documents for 
     * @param {*} data Firebase_dump cards data
     */
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

    /**
     * Using the given database, branch off and create a new database
     * 
     * @param {*} dbName New database name
     * 
     * @returns New database instance
     */
    createNewDatabase (dbName) {
        return new Database(this.app, dbName);
    }
}

export default Database;