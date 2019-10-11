var fs = require('fs')

var data = JSON.parse(fs.readFileSync('app/src/data/state-finance.json', 'utf8'))
console.log(Object.keys(data))
const contributions = JSON.parse(data.contributions)
const expenditures = JSON.parse(data.expenditures)
console.log(expenditures.slice(0,5))