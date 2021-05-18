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

export {
    syncLocalDatabase,
}