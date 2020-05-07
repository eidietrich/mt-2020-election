/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

// You can delete this file if you're not using it

const { candidates, races } = require('./src/data/app-copy.json')
const preppedData = require('./src/data/app-prepped-data.json') // TODO: Change file name
const coverageLinks = require('./src/data/outside-links.json')

const financeSummaries = preppedData.finance

const filterToActive = candidates => candidates.filter(d => d.status == 'Announced')
const activeCandidates = filterToActive(candidates)

// redundant w/ src/logic/functions.js bc node doesn't like modern import calls
const makeCandidateKey = candidate => (candidate.first_name + '-' + candidate.last_name).replace(/\s/g, '-')
const makeRaceKey = race => race.position.replace(/\s/g, '-')

// TODO: Move data-matching logic to standalone process script
activeCandidates.forEach(candidate => {
    candidate.finance = financeSummaries.find(summary => summary.key === makeCandidateKey(candidate))
    candidate.coverageLinks = coverageLinks.filter(link => link.candidate === makeCandidateKey(candidate))
})

races.forEach(race => {
    // collect media coverage links and deduplicate
    // Will pull in first entry
    const withDuplicates = coverageLinks.filter(link => link.race === makeRaceKey(race))
    const uniqueUrls = Array.from(new Set(withDuplicates.map(d => d.link)))
    const deduped = uniqueUrls.map(url => withDuplicates.find(d => d.link === url))
    race.coverageLinks = deduped
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
                raceCandidates,
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