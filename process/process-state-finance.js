// script for parsing

const {
    getJson,
    writeJson,
    filterToActive,
    sumAmount,
    forGeneral,
    forPrimary,
    makeCandidateKey
} = require('./functions.js')

const contributionTypes = {
    selfFinance: ['Personal contributions','Loans'],
    committee: ['PAC contributions','Political party contributions','Incidental committee contributions','Other political committee contributions'],
    individual: ['Individual contributions'],
    other: ['Unitemized contributions','Fundraisers & misc']
}

// Raw data source
// Assumes some cleaning on scraper side
// TODO: Decide whether it makes sense to wrap that into a scraper script or not

// TODO: Look at merging state/federal data into common format here
// TODO: This also needs some refactoing

const FINANCE_SOURCE = './scrapers/state-finance-reports/data/state-finance-cleaned.json'
const APP_CONTRIBUTION = './app/src/data/state-finance.json'

const APP_COPY_PATH = './app/src/data/app-copy.json'

const { candidates, races } = getJson(APP_COPY_PATH)
const raw = getJson(FINANCE_SOURCE)
const contributions = cleanContributions(JSON.parse(raw.contributions))
const expenditures = cleanExpenditures(JSON.parse(raw.expenditures))

// sort candidates into state/federal races
candidates.forEach(candidate => {
    const race = races.find(race => race.position === candidate.position)
    candidate.jurisdiction = race.type
})

console.log(
`## State Finance:
Processing ${contributions.length} contributions, ${expenditures.length} expenditures`
)
// run tests
checkCandidateMatches(candidates, contributions)

// perform aggregation calcs
const candidateSummaries = makeCandidateSummaries(candidates, contributions, expenditures)
// console.table(candidateSummaries)
// console.log('3)\n', candidateSummaries[0].contributionsByZip)

const recombined = {
    contributions: contributions,
    expenditures: expenditures,
    candidateSummaries: candidateSummaries
}
writeJson(APP_CONTRIBUTION, recombined)

function cleanContributions(contributions) {
    // categorize contribution type
    // Some of this is already done in clean.py - consider changing
    contributions.forEach(d => {
        if (contributionTypes.selfFinance.includes(d.type)) d.type2 = 'Self financing'
        if (contributionTypes.committee.includes(d.type)) d.type2 = 'Committee support'
        if (contributionTypes.individual.includes(d.type)) d.type2 = 'Individual donations'
        if (contributionTypes.other.includes(d.type)) d.type2 = 'Other support'

        d.Zip = String(d.Zip)
    })
    

    return contributions
}

function cleanExpenditures(expenditures){
    return expenditures
}


// Data testing

function checkCandidateMatches(candidates, contributions){
    const stateFinanceDataNames = Array.from(new Set(contributions.map(d => d.Candidate)))
    const candidatesWithoutStateFinanceDataMatch = filterToActive(candidates)
        .filter(d => d.jurisdiction === 'state') // exclude federal candidates
        .filter(d => !(stateFinanceDataNames.includes(d.state_finance_data_name)))
    console.log('No state finance data for:', candidatesWithoutStateFinanceDataMatch.map(d => `${d.first_name} ${d.last_name}`))
}
function checkForMissingReportingPeriods(){

}
function checkForNonsensicalAmounts(){

}




// OUTPUTS

function makeCandidateSummaries(candidates, contributions, expenditures){
    const candidateSummaries = filterToActive(candidates).map(candidate => {
        const candidateContributions = contributions.filter(d => d.Candidate === candidate.state_finance_data_name)
        const candidateExpenditures = expenditures.filter(d => d.Candidate === candidate.state_finance_data_name)
        const summaries = summarizeByCandidate(candidateContributions, candidateExpenditures)
        const dates = Array.from(
            new Set(candidateContributions.concat(candidateExpenditures)
            .map(d => d['Date Paid'])))
            .sort((a,b) => new Date(a) - new Date(b)
        )
        const cumulativeContributions = runningTotalByDate(dates, candidateContributions, 'Fundraising')
        const cumulativeExpenditures = runningTotalByDate(dates, candidateExpenditures, 'Spending')
        const contributionsByZip = totalByZipcode(candidateContributions)

        return ({
            key: makeCandidateKey(candidate),
            ...summaries,
            cumulativeContributions,
            cumulativeExpenditures,
            contributionsByZip,
        })
    })

    return candidateSummaries
}

function runningTotalByDate(dates, items, type){
    // combine contributions or expenditures for cumulative chart
    let runningTotal = 0
    return dates.map(date => {
        runningTotal += sumAmount(items.filter(d => d['Date Paid'] === date))
        return {
            date: date,
            cumulative: runningTotal,
            type: type
        }
    })
}
function totalByZipcode(contributions){
    // individual contributions in Montana for each candidate
    // formatted for location map
    const mtIndividualContributions = contributions
        .filter(d => d.type2 === 'Individual donations')
        .filter(d => d.State === 'MT')
    const uniqueMTZips = Array.from(new Set(mtIndividualContributions.map(d => d.Zip)))
    // remove "bad" zips from data messiness
    // also trim anything zip with extra characters
    return uniqueMTZips
        .filter(zip => zip.substring(0,2) === '59')
        .map(zip => zip.substring(0,5))
        .map(zip => {
            const zipContributions = mtIndividualContributions.filter(d => d.Zip.substring(0,5) === zip)
                return {
                zip: zip,
                amount: sumAmount(zipContributions),
                number: zipContributions.length,
            }
        })
}
function summarizeByCandidate(contributions, expenditures){
    // Prep values for pull stats
    const totalRaised = sumAmount(contributions)
    const totalRaisedPrimary = sumAmount(forPrimary(contributions))
    const totalRaisedGeneral = sumAmount(forGeneral(contributions))
    const totalSpent = sumAmount(expenditures)

    const individualContributions = contributions.filter(d => d.type2 === 'Individual donations')
    const numIndividualContributions = individualContributions.length
    const averageIndividualContributionSize = sumAmount(individualContributions) / numIndividualContributions

    return {
        totalRaised,
        totalRaisedPrimary,
        totalRaisedGeneral,
        totalSpent,
        numIndividualContributions,
        averageIndividualContributionSize
    }
}