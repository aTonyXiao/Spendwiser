var loadCard = require('./src/loadCard');
var parser = require('./src/parser');

// parse arguments
let args = process.argv.slice(2);

// check arguments
if (args.length != 1) {
    console.log("node load.js <file_path>[.json]")
    process.exit(1);
}

// read in the file
let data = parser.readFile(args[0]);

// check if read in correctly
if (data == null) {
    console.log("Invalid file path!");
    process.exit(1);
}

console.log("Loading cards into database..");
// load it in
data.forEach(element => {
    loadCard.loadCard(element);
});