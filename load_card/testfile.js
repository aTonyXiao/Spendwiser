var loadCard = require('./loadCard');
var parser = require('./parser');

let fileNames = "/Users/nathankong/Spendwiser/load_card/cards_data.json";
let data = parser.readFile(fileNames);
data.forEach(element => {
    loadCard.load_card(element);
});