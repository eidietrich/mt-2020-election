/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

// You can delete this file if you're not using it

const { candidates, races } = require('./src/data/app-copy.json')
const stateFinance = require('./src/data/state-finance.json')

const stateContributions = stateFinance.contributions
const stateExpenditures = stateFinance.expenditures
const candidateSummaries = stateFinance.candidateSummaries

const excludeStatuses = ['Withdrawn','Not Running','Rumored','Potential','Suspended']
const filterToActive = candidates => candidates.filter(d => !excludeStatuses.includes(d.status))

const activeCandidates = filterToActive(candidates)

// redundant w/ src/logic/functions.js bc node doesn't like modern import calls
const makeCandidateKey = candidate => (candidate.first_name + '-' + candidate.last_name).replace(/\s/g, '-')
const makeRaceKey = race => race.position.replace(/\s/g, '-')

// TODO: Move data-matching logic to standalone script
// Add in server-side processing to optimize client performance

activeCandidates.forEach(candidate => {
    candidate.stateContributions = stateContributions.filter(d => d.Candidate === candidate.state_finance_data_name)
    candidate.stateExpenditures = stateExpenditures.filter(d => d.Candidate === candidate.state_finance_data_name)
    candidate.fundraisingSummary = candidateSummaries.find(summary => summary.key === makeCandidateKey(candidate))
})

exports.createPages = async({ actions: { createPage } }) => {
    
    // race pages
    races.forEach(race => {
        const raceCandidates = activeCandidates.filter(candidate => candidate.position === race.position)
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
    activeCandidates.forEach(candidate => {
        const race = races.find(race => race.position === candidate.position)
        // const candidateSummary = candidateSummaries.find(summary => summary.key === makeCandidateKey(candidate))
        createPage({
            path: `/candidates/${makeCandidateKey(candidate)}`,
            component: require.resolve('./src/templates/candidate.js'),
            context: {
                candidate,
                race,
                // candidateSummary,
            },
        })
    })

}