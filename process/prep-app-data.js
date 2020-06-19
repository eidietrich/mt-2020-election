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
    checkStateCandidateFundraising,
    // processing
    makeStateCandidateSummaries
} = require('./stateFinanceFunctions.js')

const {
    // testing
    checkFederalCandidateMatches,
    checkFederalReportingPeriodCompleteness,
    // processing
    makeFederalCandidateSummaries
} = require('./federalFinanceFunctions.js')


// Raw data source
// Assumes some cleaning on scraper side
// TODO: Decide whether it makes sense to wrap that into a scraper script or not

// TODO: Look at merging state/federal data into common format here
// TODO: This also needs some refactoing

// INPUTS
// TODO: Add STATE_FINANCE_SUMMARY
// const STATE_FINANCE_SUMMARY = './scrapers/state-finance-reports/data/state-candidate-summaries.json'
const STATE_FINANCE_SOURCE = './scrapers/state-finance-reports/data/state-finance-cleaned.json'
const FED_FINANCE_SUMMARY = './scrapers/fed-finance-reports/data/candidate-summaries.json'
const FED_ITEMIZED_RECEIPTS = './scrapers/fed-finance-reports/data/itemized-receipts.json'

const PRIMARY_RESULTS = './scrapers/primary-results/summary.json'

// Memo to past self: Why is this input COMING from the app folder?
const APP_COPY_PATH = './app/src/data/app-copy.json' // TODO: Standardize this

// OUTPUT
const APP_DATA = './app/src/data/app-prepped-data.json'

// const OUTSIDE_LINKS_PATH = './data/outside-links.json'

// const financeDateRange = ["01/01/2019", "11/31/2020"]


const { candidates, races } = getJson(APP_COPY_PATH)
// const { links } = getJson(OUTSIDE_LINKS_PATH)

const stateFinance = getJson(STATE_FINANCE_SOURCE)
const stateContributions = cleanStateContributions(JSON.parse(stateFinance.contributions))
const stateExpenditures = cleanStateExpenditures(JSON.parse(stateFinance.expenditures))

const federalFinanceTotals = getJson(FED_FINANCE_SUMMARY)
const federalContributions = getJson(FED_ITEMIZED_RECEIPTS)
const federalExpenditures = [] // TODO

const primaryResults = getJson(PRIMARY_RESULTS)

// const activeCandidates = filterToActive(candidates)
const activeCandidates = candidates


// sort candidates into state/federal races
activeCandidates.forEach(candidate => {
    const race = races.find(race => race.position === candidate.position)
    candidate.jurisdiction = race.type
})
activeFederalCandidates = activeCandidates.filter(d => d.jurisdiction === 'federal')
activeStateCandidates = activeCandidates.filter(d => d.jurisdiction === 'state')

// console.log(
// `## Candidates:
// ${activeCandidates.length} Active candidates
// ${activeFederalCandidates.length} Federal
// ${activeStateCandidates.length} State
// ${ activeCandidates.length - activeFederalCandidates.length - activeStateCandidates.length} UNSORTED
// `
// )

// run pre-processing tests
checkStateCandidateMatches(activeStateCandidates, stateFinance.summaries)
checkFederalCandidateMatches(activeFederalCandidates, federalFinanceTotals)
checkStateReportingPeriodCompleteness(activeStateCandidates, stateFinance.summaries, stateContributions)
checkFederalReportingPeriodCompleteness(activeFederalCandidates, federalContributions)

// perform aggregation calcs
// console.log(
//     `\n## State Finance:
//     Processing ${stateContributions.length} contributions, ${stateExpenditures.length} expenditures
//     `)
const stateFinanceSummaries = makeStateCandidateSummaries(activeStateCandidates, stateFinance.summaries, stateContributions, stateExpenditures)
const abbreviatedStateSummaries = stateFinanceSummaries.map(({
    key,
    totalRaised,
    totalSpent,
    itemizedIndividual,
    itemizedCommittees,
    itemizedSelfFinance,
    unitemized,
    numIndividualContributions,
    numIndividualContributionsAtLimit,
    percentIndividualFromMontana,
    numReportingPeriods,
    firstReportingDate,
    lastReportingDate,
    contributionLimit
}) => ({
    key,
    totalRaised,
    totalSpent,
    itemizedIndividual,
    itemizedCommittees,
    itemizedSelfFinance,
    unitemized,
    numIndividualContributions,
    numIndividualContributionsAtLimit,
    percentIndividualFromMontana,
    numReportingPeriods,
    firstReportingDate,
    lastReportingDate,
    contributionLimit
}))
writeJson('./process/state-candidate-summary.json', abbreviatedStateSummaries)
// console.log(
//     `\n## Federal Finance:
//     Processing ${federalContributions.length} contributions, ${federalExpenditures.length} expenditures
//     `)
const federalFinanceSummaries = makeFederalCandidateSummaries(activeFederalCandidates, federalFinanceTotals, federalContributions, federalExpenditures)

const financeSummaries = stateFinanceSummaries.concat(federalFinanceSummaries)

// post-processing tests
// checkStateCandidateFundraising(stateFinanceSummaries)

const preppedData = {
    finance: financeSummaries,
    primaryResults: primaryResults,
}

writeJson(APP_DATA, preppedData)
