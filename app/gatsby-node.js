/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

// You can delete this file if you're not using it

const { candidates, races } = require('./src/data/app-copy.json')
const stateFinance = require('./src/data/state-finance.json')

const stateContributions = JSON.parse(stateFinance.contributions)
const stateExpenditures = JSON.parse(stateFinance.expenditures)

// redundant w/ src/logic/functions.js bc node doesn't like modern import calls
const makeCandidateKey = candidate => (candidate.first_name + '-' + candidate.last_name).replace(/\s/g, '-')
const makeRaceKey = race => race.position.replace(/\s/g, '-')

// TODO: Move data-matching logic to standalone script
// Add in server-side processing to optimize client performance

const getCandidateContributions = candidate => {
    const key = `${candidate.last_name}, ${candidate.first_name}`
    const matches = stateContributions.filter(d => d.Candidate.trim() === key)
    // console.log('cont', key, matches.length)
    return matches
}
const getCandidateExpenditures = candidate => {
    const key = `${candidate.last_name}, ${candidate.first_name}`
    const matches = stateExpenditures.filter(d => d.Candidate.trim() === key)
    // console.log('exp', key, matches.length)
    return matches
}

candidates.forEach(candidate => {
    candidate.stateContributions = getCandidateContributions(candidate)
    candidate.stateExpenditures = getCandidateExpenditures(candidate)
})

exports.createPages = async({ actions: { createPage } }) => {
    
    // race pages
    races.forEach(race => {
        const raceCandidates = candidates.filter(candidate => candidate.position === race.position)
        createPage({
            path: `/races/${makeRaceKey(race)}`,
            component: require.resolve('./src/templates/race.js'),
            context: {
                race,
                raceCandidates
            },
        })

    })
    
    // candidate pages
    candidates.forEach(candidate => {
        console.log(candidate.last_name)
        const race = races.find(race => race.position === candidate.position)
        createPage({
            path: `/candidates/${makeCandidateKey(candidate)}`,
            component: require.resolve('./src/templates/candidate.js'),
            context: {
                candidate,
                race
            },
        })
    })

}