/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

// You can delete this file if you're not using it

const { candidates } = require('./src/data/app-copy.json')
const stateFinance = require('./src/data/state-finance.json')

const stateContributions = JSON.parse(stateFinance.contributions)
const stateExpenditures = JSON.parse(stateFinance.expenditures)

// redundant w/ src/logic/functions.js bc node doesn't like modern import calls
const makeCandidateKey = candidate => (candidate.first_name + '-' + candidate.last_name).replace(/\s/g, '-')

// TODO: Move data-matching logic to standalone script

const getCandidateContributions = candidate => {
    const key = `${candidate.last_name}, ${candidate.first_name}`
    const matches = stateContributions.filter(d => d.Candidate.trim() === key)
    console.log('cont', key, matches.length)
    return matches
}
const getCandidateExpenditures = candidate => {
    const key = `${candidate.last_name}, ${candidate.first_name}`
    const matches = stateExpenditures.filter(d => d.Candidate.trim() === key)
    console.log('exp', key, matches.length)
    return 
}

exports.createPages = async({ actions: { createPage } }) => {
    // bills pages
    candidates.forEach(candidate => {
        const stateContributions = getCandidateContributions(candidate)
        const stateExpenditures = getCandidateExpenditures(candidate)
        createPage({
            path: `/candidates/${makeCandidateKey(candidate)}`,
            component: require.resolve('./src/templates/candidate.js'),
            context: {
                candidate,
                stateContributions,
                stateExpenditures
            },
        })
    })

}