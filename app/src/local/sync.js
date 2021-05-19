import {appBackend} from "../network/backend"
import * as storage from './storage'

async function replaceCardId(accountName, full_location, local_id, remote_id) {
    return new Promise((resolve, reject) => {
        console.log("Replacing card id field for this card in location: " + full_location + " with " + remote_id);
        storage.setLocalDB(accountName, full_location, {'cardId': remote_id}, true, () => {
            // Replace card id field in the user's list of cards
            let cardInfoLocation = "users." + accountName + ".cards." + local_id;
            console.log("Replacing card id field for user card in location: " + cardInfoLocation + " with: " + remote_id);
            storage.setLocalDB(accountName, cardInfoLocation, {'cardId': remote_id}, true, () => {
                resolve();
            });
        });
    })
}

async function replaceTransactionDocId(accountName, local_id, remote_id) {
    return new Promise((resolve, reject) => {
        let docLocation = "users." + accountName + ".transactions." + remote_id;
        console.log("Replacing doc id field for user transaction in location: " + docLocation + " with: " + remote_id);
        storage.setLocalDB(accountName, docLocation, {'docId': remote_id}, true, () => {
            resolve();
        });
    });
}

async function replaceCardDocId(accountName, remote_id) {
    return new Promise((resolve, reject) => {
        let docLocation = "users." + accountName + ".cards." + remote_id;
        console.log("Replacing doc id field for user card in location: " + docLocation + " with: " + remote_id);
        storage.setLocalDB(accountName, docLocation, {'docId': remote_id}, true, () => {
            resolve();
        });
    });
}

async function replaceUnsyncedDocumentsId(accountName, location, local_id, remote_id) {
    return new Promise((resolve, reject) => {
        storage.replaceUnsyncedDocumentsId(accountName, location, local_id, remote_id, () => {
            resolve();
        });
    });
}

async function syncDocument(accountName, document) {
    return new Promise((resolve, reject) => {
        let location = document['location'];
        let id = document['id'];
        let type = document['type'];
        let full_location = location + '.' + id;

        storage.getLocalDB(accountName, full_location, (data) => {
            if (data == null) {
                resolve();
            } else {
                if (type == 'add') {
                    appBackend.remoteDBAdd(location, data, (remote_id) => {
                        storage.modifyDBEntryMetainfo(accountName, location, true, id, remote_id, async () => {
                            if (location.includes('cards') && !location.includes("users")) {
                                await replaceCardId(accountName, full_location, id, remote_id);
                            }  
                            else if (location.includes('transactions')) {
                                await replaceTransactionDocId(accountName, id, remote_id);
                            }
                            else if (location.includes('cards')) {
                                await replaceCardDocId(accountName, remote_id);

                                // Replace the docId variable ON FIREBASE
                                await new Promise((resolve, reject) => {
                                    appBackend.remoteDBSet(location + "." + remote_id, {"docId": remote_id}, true, () => {
                                        resolve();
                                    });
                                })
                            }
                            await replaceUnsyncedDocumentsId(accountName, location, id, remote_id);
                            storage.removeDocumentFromUnsyncedList(accountName, location, id, () => {
                                resolve();
                            });
                        });
                    });
                } else if (type == 'delete') {
                    appBackend.remoteDBDelete(location + "." + id, () => {
                        storage.removeDocumentFromUnsyncedList(accountName, location, id, () => {
                            resolve();
                        });
                    });
                } else if (type == 'set') {
                    appBackend.remoteDBSet(location + "." + id, data, document['merge'], () => {
                        storage.removeDocumentFromUnsyncedList(accountName, location, id, () => {
                            resolve();
                        });
                    });
                }
            }
        });
    });
}

async function syncLocalDatabase() {
    appBackend.getUserID(async (accountName) => {
        storage.getUnsyncedDocuments(accountName, async (unsynced_documents) => {
            console.log("Got unsynced documents: ");
            console.log(unsynced_documents);
            for (let i = 0; i < unsynced_documents.length; i++) {
                await syncDocument(accountName, unsynced_documents[i]);
            }
        });
    });
}

async function addItemToLocalDB(accountName, document, id, data) {
    return new Promise((resolve, reject) => {
        storage.addLocalDB(accountName, document + "." + id, data, (local_id) => {
            storage.modifyDBEntryMetainfo(accountName, document, true, local_id, id, () => {
                resolve();
            })
        });
    });
}

async function addCardInfoToDB(accountName, cardId) {
    return new Promise((resolve, reject) => {
        appBackend.remoteDBGet("cards", ['cardId', '==', cardId], (cardData) => {
            storage.addLocalDB(accountName, "cards", cardData, true, (local_id) => {
                storage.modifyDBEntryMetainfo(accountName, "cards", true, local_id, cardId, () => {
                    resolve();
                })
            });
        });
    });
}

async function syncRemoteSubcollection(location) {
    appBackend.getUserID((accountId) => {
        let full_location = "users." + accountId + "." + location;
        storage.getSubcollectionLocalDB(accountId, full_location, (local_collection) => {

            // get local collection names to check for matching ids later
            let localDocIds = [];
            local_collection.forEach(doc => {
                localDocIds.push(doc.docId);
            });

            appBackend.dbGetSubCollectionsRemote(full_location, async (remote_collection) => {
                for (let i = 0; i < remote_collection.length; i++) {
                    let remote_item = remote_collection[i];

                    if (localDocIds.includes(remote_item['docId'])) {
                        if (location == "cards") {
                            // ALSO pull down the actual card info
                            let users_card = remote_item;
                            await addCardInfoToDB(accountId, remote_item['cardId']);
                            await addItemToLocalDB(accountId, full_location, remote_item['docId'], users_card);
                        } else if (location == "transactions") {
                            let users_transaction = remote_item;
                            await addItemToLocalDB(accountId, full_location, remote_item['docId'], users_transaction);
                        }
                    }
                }
            });
        });
    });
}

async function syncRemoteDatabase() {
    appBackend.userAccountType((type) => {
        if (type == 'normal') {
            syncRemoteSubcollection("cards");
            syncRemoteSubcollection("transactions");
        } else {
            // Do nothing
        }
    });
}

/*
    idk(location, callback) {
        console.log("called idk")
        this.getUserID((accountId) => {
            this.userAccountType((type) => {
                if (type == 'normal') {
                    storage.getSubcollectionLocalDB(accountId, location, (local_collection) => {
                        // get local collection names to check for matching ids later
                        let localIds = [];
                        local_collection.forEach(doc => {
                            localIds.push(doc.cardId);
                        })

                        // console.log('local ids')
                        // console.log(localIds);

                        let dbloc = getDatabaseLocation(this.database, location);
                        // check firebase documents by matching id
                        dbloc.get().then((query) => {
                            var checkForFirebaseCards = new Promise((resolve, reject) => {
                                var querySize = query.size; // firebase .get() isn't of array type so get length this way
                                var index = 0;

                                if (querySize == 0) resolve();
                                query.forEach(doc => {
                                    var currentDoc = doc.data();
                                    currentDoc["docId"] = doc.id;

                                    // add to local db if list of local ids doesn't contain the current firebase id
                                    if (!localIds.includes(doc.id)) {
                                        local_collection.push(currentDoc);

                                        // console.log('adding ' + doc.id)
                                        // get card information from firebase to add to local card database
                                        const cardLocation = getDatabaseLocation(this.database, "cards." + currentDoc.cardId);
                                        cardLocation.get().then((cardData) => {
                                            // add card to cards local
                                            storage.addLocalDB(accountId, "cards", cardData.data(), true, (local_query_id) => {
                                                storage.modifyDBEntryMetainfo(accountId, "cards", true, local_query_id, doc.id, () => {
                                                    // add card to user cards list
                                                    storage.addLocalDB(accountId, "users." + accountId + ".cards", currentDoc, true, () => {
                                                        // console.log('added ' + doc.id);
                                                        index += 1;
                                                        if (index == querySize) {
                                                            // console.log('resolving')
                                                            resolve();
                                                        }
                                                        // console.log('indexed, now at ' + index)
                                                        // storage.printLocalDB();
                                                    })
                                                })
                                            })
                                        })
                                    } else {
                                        index += 1;
                                    }
                                })
                            })

                            // wait for storage to add cards to local database to finish before executing callback
                            checkForFirebaseCards.then(() => {
                                console.log('RESOLVED');

                                // console.log('local collection: ')
                                // console.log(local_collection)

                                // console.log('storage')
                                // storage.printLocalDB();
                                

                                callback(local_collection);
                            })
                        })
                    });

                // offline mode
                } else {
                    storage.getSubcollectionLocalDB(accountId, location, callback);
                }
            })
        })
    }
    */

export {
    syncLocalDatabase,
    syncRemoteDatabase,
}