const fs = require('fs')

// consts
// candidate statuses excluded from summary page
const excludeStatuses = ['Withdrawn','Not Running','Rumored','Potential','Suspended']

// Utility functions
module.exports.getJson = (path) => JSON.parse(fs.readFileSync(path))

module.exports.writeJson = (path, data) => {
    fs.writeFile (path, JSON.stringify(data), function(err) {
        if (err) throw err;
        console.log('Written to', path);
        }
    );
}

module.exports.getDaysArray = function(start, end) {
    // from https://stackoverflow.com/questions/4413590/javascript-get-array-of-dates-between-2-dates
    for(var arr=[],dt=start; dt<=end; dt.setDate(dt.getDate()+1)){
        arr.push(new Date(dt));
    }
    return arr;
};

module.exports.filterToActive = candidates => candidates.filter(d => !excludeStatuses.includes(d.status))
// contribution/expenditure handling
module.exports.sumAmount = entries => Math.round(entries.reduce((acc, obj) => obj['Amount'] + acc, 0), 2)
module.exports.forPrimary = contributions => contributions.filter(d => d['Election Type'] === 'PM')
module.exports.forGeneral = contributions => contributions.filter(d => d['Election Type'] === 'GN')

module.exports.makeCandidateKey = candidate => (candidate.first_name + '-' + candidate.last_name).replace(/\s/g, '-')
module.exports.makeRaceKey = race => race.position.replace(/\s/g, '-')