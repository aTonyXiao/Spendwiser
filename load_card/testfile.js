var loadCard = require('./loadCard');
var parser = require('./parser');

let fileNames = "./card_data.json";
let data = parser.readFile(fileNames);
loadCard.load_card(data);