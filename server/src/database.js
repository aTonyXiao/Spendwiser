import mongoose from "mongoose";

// maps query operators to a filtering function for mongo queries
const query_operators = {"<=": (req, query) => {
                            return req.where(query[0]).lte(query[1]);
                        }, "<": (req, query) => {
                            return req.where(query[0]).lt(query[1]);
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

    /**
     * (private): Adds all of the HTTP requests for a certain model
     */
    addModelRequests (prefix, modelName, model) {
        // the uri for this model
        let uri = prefix + modelName;

        // get all docs request with query support
        this.app.get(uri, this.auth, (req, res) => {
            if (Object.keys(req.query).length == 0) { // when there is no query arguments (?where doesnt exist)
                // mongoose: find all for the given model
                model.find((err, data) => {
                    if (err || data == null) res.sendStatus(500); // server err
                    else res.json(data); // send the data
                });
            } else if (Object.keys(req.query).length == 1 && typeof req.query.where !== "undefined") {
                // build the query
                let rawQuery = [], query = [], operators = [];
                if (!Array.isArray(req.query.where)) rawQuery.push(req.query.where); // convert to array if not
                else rawQuery = req.query.where; // just set the array again
                // go through the raw query array for each query that was in the request
                for (let i = 0; i < rawQuery.length; i++) {
                    // try and split each query operator
                    for (let j = 0; j < query_operators_list.length; j++) {
                        query[i] = rawQuery[i].split(query_operators_list[j]);
                        if (query[i].length == 2) { // if successful, then set the operator for the query
                            operators[i] = query_operators_list[j];
                            break;
                        }
                        // if there were not valid query operators, bad request
                        if (j == query_operators_list.length - 1) {
                            res.sendStatus(400);
                            return;
                        }
                    }
                }
                let dbRequest = model.find(); // start a find for this model
                // go through each query and filter accordingly
                for (let i = 0; i < query.length; i++) {
                    dbRequest = query_operators[operators[i]](dbRequest, query[i]);
                }
                // execute the find db request
                dbRequest.exec((err, data) => {
                    if (err || data == null) res.sendStatus(500); // server err
                    else res.json(data); // send the data
                });
            } else { // bad request format
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

    /**
     * (private): Adds all of the Subdocument HTTP requests for a certain model
     */
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
                // build the query
                let rawQuery = [], query = [], operators = [];
                if (!Array.isArray(req.query.where)) rawQuery.push(req.query.where); // convert to array if not
                else rawQuery = req.query.where; // just set the array again
                // go through the raw query array for each query that was in the request
                for (let i = 0; i < rawQuery.length; i++) {
                    // try and split each query operator
                    for (let j = 0; j < query_operators_list.length; j++) {
                        query[i] = rawQuery[i].split(query_operators_list[j]);
                        if (query[i].length == 2) { // if successful, then set the operator for the query
                            operators[i] = query_operators_list[j];
                            break;
                        }
                        // if there were not valid query operators, bad request
                        if (j == query_operators_list.length - 1) {
                            res.sendStatus(400);
                            return;
                        }
                    }
                }
                // build a query for the subdocs
                let selectQuery = new mongoose.Query();
                for (let i = 0; i < query.length; i++) { // go through each query
                    // cast the value to compare since mongo doesn't have support for that in aggregate
                    query[i][1] = model.schema.path(subdoc).schema.path(query[i][0]).cast(query[i][1]);
                    query[i][0] = subdoc + "." + query[i][0]; // get the value using dot notation for the subdoc
                    // filter accordingly
                    selectQuery = query_operators[operators[i]](selectQuery, query[i]);
                }
                let dbRequest = model.aggregate(); // start a db aggregate request
                dbRequest = dbRequest.match({"_id": mongoose.Types.ObjectId(fixID(req.params.id))}); // first match with the id
                dbRequest = dbRequest.unwind(subdoc); // unwind the subdocument array
                dbRequest = dbRequest.match(selectQuery.getQuery()); // match according to the query built from earlier
                dbRequest = dbRequest.group({"_id": "$_id", "result": {"$addToSet": "$" + subdoc}}); // build the result
                dbRequest.exec((err, data) => { // execute the aggregate
                    if (err || data == null) res.sendStatus(500); // server err
                    else res.json(data.length == 0 ? [] : data[0].result); // send the data
                });
            } else { // bad request format
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
                if (err) console.log(err);
                else collection.findByIdAndUpdate(resp._id, {cardId: resp._id.toString()}, (err, data) => console.log("added: " + data._id));
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