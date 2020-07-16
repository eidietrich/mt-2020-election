/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

// You can delete this file if you're not using it

const { candidates, races } = require('./src/data/app-copy.json')
const preppedData = require('./src/data/app-prepped-data.json') // TODO: Change file name
const coverageLinks = require('./src/data/outside-links.json').filter(d => d != null)
const issueStatements = require('./src/data/q-and-a.json')

const financeSummaries = preppedData.finance
const primaryResults = preppedData.primaryResults

// const filterToActive = candidates => candidates.filter(d => d.status === 'Announced')
// const filterToActive = candidates => candidates.filter(d => d.status === 'Announced')
// const activeCandidates = filterToActive(candidates)
const activeCandidates = candidates

// redundant w/ src/logic/functions.js bc node doesn't like modern import calls
const makeCandidateKey = candidate => (candidate.first_name + '-' + candidate.last_name).replace(/\s/g, '-')
const makeRaceKey = race => race.position.replace(/\s/g, '-')

// TODO: Move data-matching logic to standalone process script
activeCandidates.forEach(candidate => {
    const candidateKey = makeCandidateKey(candidate)
    candidate.finance = financeSummaries.find(summary => summary.key === candidateKey)
    candidate.coverageLinks = coverageLinks.filter(link => link.candidate === candidateKey)
    candidate.issues = issueStatements.find(statement => statement.name.replace(/\s/g, '-') === candidateKey)
})

races.forEach(race => {
    const raceKey = makeRaceKey(race)
    // collect media coverage links and deduplicate
    // Will pull in first entry
    const withDuplicates = coverageLinks.filter(link => link.race === raceKey)
    const uniqueUrls = Array.from(new Set(withDuplicates.map(d => d.link)))
    const deduped = uniqueUrls.map(url => withDuplicates.find(d => d.link === url))
    race.coverageLinks = deduped

    // primary results
    const primaryResultsByDistrict = primaryResults.filter(d => d.raceKey === raceKey) // plural b/c of races w/ districts
    if (primaryResultsByDistrict.length === 0) console.log('Missing primary result', raceKey)
    race.primaryResultsByDistrict = primaryResultsByDistrict
})

exports.createPages = async({ actions: { createPage } }) => {
    // race pages
    races.forEach(race => {
        const raceKey = makeRaceKey(race)
        const raceCandidates = activeCandidates.filter(candidate => candidate.position === race.position)
        createPage({
            path: `/races/${raceKey}`,
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