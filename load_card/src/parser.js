var isValid = require('is-valid-path');
const fs = require('fs');
const readline = require('readline');

/**
 * Parse the JSON file for cards
 */
const readJson = (path) => {
    let rawdata = fs.readFileSync(path);
    let cards = JSON.parse(rawdata);
    return cards['cards'];
}

/**
 * 
 * @param {string} path - path of file which to read
 */
exports.readFile = (path) => {
    // check if file is valid
    if (!isValid(path)) {
        // TODO: throw error
    }

    // read the JSON
    return readJson(path);
}