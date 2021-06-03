var isValid = require('is-valid-path');
const fs = require('fs');
const readline = require('readline');

/**
 * 
 */
const readJson = (path) => {
    let rawdata = fs.readFileSync(path);
    let cards = JSON.parse(rawdata);
    console.log(cards);

    return data;
}

/**
 * 
 */
const readTxt = (path) => {

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

    // separate string
    let extension = path.split(".")[2];
    let data = null;
    switch (extension) {
        case ("txt"):
            data = readTxt(path);
            break;
        case "json":
            data = readJson(path);
            break;
        default:
            console.log("not a valid extension!")
            // TODO: throw some error
            break
    }

    return data;
}