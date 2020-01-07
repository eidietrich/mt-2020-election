// script for parsing data into app appropriate

const {
    getJson,
    writeJson,
    filterToActive,
} = require('./functions.js')

const {
    // cleaning
    cleanStateContributions,
    cleanStateExpenditures,
    // testing
    checkStateCandidateMatches,
    checkStateReportingPeriodCompleteness,
    // processing
    makeStateCandidateSummaries
} = require('./stateFinanceFunctions.js')

const {
    // testing
    checkFederalCandidateMatches,
    // processing
    makeFederalCandidateSummaries
} = require('./federalFinanceFunctions.js')


// Raw data source
// Assumes some cleaning on scraper side
// TODO: Decide whether it makes sense to wrap that into a scraper script or not

// TODO: Look at merging state/federal data into common format here
// TODO: This also needs some refactoing

const STATE_FINANCE_SOURCE = './scrapers/state-finance-reports/data/state-finance-cleaned.json'
const FED_FINANCE_SUMMARY = './scrapers/fed-finance-reports/data/raw-summaries.json'
const FED_ITEMIZED_RECEIPTS = './scrapers/fed-finance-reports/data/itemized-receipts.json'
const APP_DATA = './app/src/data/app-prepped-data.json'

const APP_COPY_PATH = './app/src/data/app-copy.json' // TODO: Standardize this
// const OUTSIDE_LINKS_PATH = './data/outside-links.json'

// const financeDateRange = ["01/01/2019", "11/31/2020"]


const { candidates, races } = getJson(APP_COPY_PATH)
// const { links } = getJson(OUTSIDE_LINKS_PATH)
const rawStateFinance = getJson(STATE_FINANCE_SOURCE)
const contributions = cleanStateContributions(JSON.parse(rawStateFinance.contributions))
const expenditures = cleanStateExpenditures(JSON.parse(rawStateFinance.expenditures))

const federalCampaignTotals = getJson(FED_FINANCE_SUMMARY)
const federalContributions = getJson(FED_ITEMIZED_RECEIPTS)

const activeCandidates = filterToActive(candidates)



// sort candidates into state/federal races
activeCandidates.forEach(candidate => {
    const race = races.find(race => race.position === candidate.position)
    candidate.jurisdiction = race.type
})
activeFederalCandidates = activeCandidates.filter(d => d.jurisdiction === 'federal')
activeStateCandidates = activeCandidates.filter(d => d.jurisdiction === 'state')

console.log(
`## Candidates:
${activeCandidates.length} Active candidates
${activeFederalCandidates.length} Federal
${activeStateCandidates.length} State
${ activeCandidates.length - activeFederalCandidates.length - activeStateCandidates.length} UNSORTED
`
)

console.log(
`## State Finance:
Processing ${contributions.length} contributions, ${expenditures.length} expenditures
`
)
// run tests
checkStateCandidateMatches(activeStateCandidates, contributions)
checkFederalCandidateMatches(activeFederalCandidates, federalCampaignTotals)
checkStateReportingPeriodCompleteness(activeStateCandidates, contributions)

// perform aggregation calcs
const stateFinanceSummaries = makeStateCandidateSummaries(activeStateCandidates, contributions, expenditures)
// console.log(stateFinanceSummaries)
const federalFinanceSummaries = makeFederalCandidateSummaries(activeFederalCandidates, federalCampaignTotals, federalContributions,[])
const financeSummaries = stateFinanceSummaries.concat(federalFinanceSummaries)

const preppedData = {
    finance: financeSummaries
}

writeJson(APP_DATA, preppedData)




function checkForNonsensicalAmounts(){

}