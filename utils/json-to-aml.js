const fs = require('fs');

const inputPath = './src/data/candidates.json'

fs.readFile(inputPath, (err, content) => {
    if (err) return console.log('Error loading file:', err);
    const candidates = JSON.parse(content)
    printListAsAML('candidates', candidates)
});

const printListAsAML = (arrayName, array) => {
    console.log(`[${arrayName}]`)
    array.forEach(item => {
        const keys = Object.keys(item)
        console.log('')
        keys.forEach(key => {
            console.log(`${key}: ${item[key]}`)
        })
    })
}

