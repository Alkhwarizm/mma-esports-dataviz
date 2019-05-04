const fs = require('fs');
const d3 = require('d3');
const path = require('path');

try {
    const dataPath = path.join(process.cwd(), process.argv[2]);
    const writePath = path.join(process.cwd(), process.argv[3]);
    const csv = fs.readFileSync(dataPath, 'utf8');
    const json = d3.csvParse(csv);
    fs.writeFileSync(writePath, JSON.stringify(json))
} catch (err) {
    console.log(err);
}