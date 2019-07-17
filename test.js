const fs = require('fs')
const input = fs.readFileSync('Transactions2013.json', 'utf-8')
console.log(JSON.parse(input))