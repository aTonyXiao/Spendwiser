const fs = require('fs');
const readline = require('readline');

module.exports = function() { 
    function fileParser(pathname) { 
        // get files from directory
        var files = fs.readdirSync(pathname);
    
        files.forEach(f => { 
            // skip this file if no text extension
            if (f.split('.').length <= 1) { 
                return
            }
    
            // check if file is a text file
            if (f.split('.')[1] == 'txt') {
                const stream = fs.createReadStream(pathname + f);
                const rl = readline.createInterface({
                    input: stream,
                    crlfDelay: Infinity
                });
    
                // read each line
                rl.on('line', (input) => {
                });
            }
        })
    }
}