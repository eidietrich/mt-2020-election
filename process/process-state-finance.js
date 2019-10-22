// script for parsing

const {timeFormat} = require('d3-time-format')
const {min, max} = require('d3-array')

const {
    getJson,
    writeJson,
    getDaysArray,
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

// const financeDateRange = ["01/01/2019", "11/31/2020"]
const dateFormat = timeFormat('%m/%d/%Y')

const { candidates, races } = getJson(APP_COPY_PATH)
const raw = getJson(FINANCE_SOURCE)
const contributions = cleanContributions(JSON.parse(raw.contributions))
const expenditures = cleanExpenditures(JSON.parse(raw.expenditures))

const activeCandidates = filterToActive(candidates)

// sort candidates into state/federal races
activeCandidates.forEach(candidate => {
    const race = races.find(race => race.position === candidate.position)
    candidate.jurisdiction = race.type
})

console.log(
`## State Finance:
Processing ${contributions.length} contributions, ${expenditures.length} expenditures`
)
// run tests
checkCandidateMatches(activeCandidates, contributions)
checkReportingPeriodCompleteness(activeCandidates, contributions)

// perform aggregation calcs
const candidateSummaries = makeCandidateSummaries(activeCandidates, contributions, expenditures)
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
        else if (contributionTypes.committee.includes(d.type)) d.type2 = 'Committee support'
        else if (contributionTypes.individual.includes(d.type)) d.type2 = 'Individual donations'
        else if (contributionTypes.other.includes(d.type)) d.type2 = 'Other support'
        else console.log('No match', d.type)
        // TODO - add code to check for self-contributions listed under "individual"
        // Start by code flagging donations from same last name

        d.Zip = String(d.Zip)

        d.reporting_start = d['Reporting Period'].split(' to ')[0]
        d.reporting_end = d['Reporting Period'].split(' to ')[1]
    })
    
    

    return contributions
}

function cleanExpenditures(expenditures){
    return expenditures
}


// Data testing

function checkCandidateMatches(candidates, contributions){
    const stateFinanceDataNames = Array.from(new Set(contributions.map(d => d.Candidate)))
    const candidatesWithoutStateFinanceDataMatch = activeCandidates
        .filter(d => d.jurisdiction === 'state') // exclude federal candidates
        .filter(d => !(stateFinanceDataNames.includes(d.state_finance_data_name)))
    console.log('\n### No state finance data for:', candidatesWithoutStateFinanceDataMatch.map(d => `${d.state_finance_data_name}`))
}
function checkReportingPeriodCompleteness(candidates, contributions){
    const names = candidates.map(d => d.state_finance_data_name).filter(d => d !== '')
    const check = names.map(name => {
        const matches = contributions.filter(d => d.Candidate === name)
        const reportingPeriods = Array.from(new Set(matches.map(d => d['Reporting Period']))).sort()
        // const reportingStarts = Array.from(new Set(matches.map(d => d.reporting_start))).sort()
        const reportingEnds = Array.from(new Set(matches.map(d => d.reporting_end))).sort()
        return {
            name,
            records: matches.length,
            periods: reportingPeriods.length,
            first_period: reportingEnds[0],
            // end_dates: reportingEnds,
        }
    })
    console.log('\n### Reporting periods:')
    console.table(check)
}
function checkForNonsensicalAmounts(){

}




// OUTPUTS

function makeCandidateSummaries(candidates, contributions, expenditures){
    const candidateSummaries = activeCandidates.map(candidate => {
        const candidateContributions = contributions.filter(d => d.Candidate === candidate.state_finance_data_name)
        const candidateExpenditures = expenditures.filter(d => d.Candidate === candidate.state_finance_data_name)
        const summaries = summarizeByCandidate(candidateContributions, candidateExpenditures)

        const firstDate = min(candidateContributions.concat(candidateExpenditures), d => d['Date Paid'])
        // TODO: Replace this w/ filing deadline
        // const lastDate = max(candidateContributions.concat(candidateExpenditures), d => d['Date Paid'])
        const lastDate = max(candidateContributions.concat(candidateExpenditures), d => d.reporting_end)
        const dates = getDaysArray(new Date(firstDate), new Date(lastDate)).map(d => dateFormat(d))
        const cumulativeContributions = runningTotalByDate(dates, candidateContributions, 'Fundraising', candidate)
        const cumulativeExpenditures = runningTotalByDate(dates, candidateExpenditures, 'Spending', candidate)
        const contributionsByZip = totalByZipcode(candidateContributions, candidate)
        const contributionsByType = totalByType(candidateContributions, candidate)

        return ({
            key: makeCandidateKey(candidate),
            ...summaries,
            cumulativeContributions,
            cumulativeExpenditures,
            contributionsByZip,
            contributionsByType,
        })
    })

    return candidateSummaries
}

function runningTotalByDate(dates, items, type, candidate){
    // combine contributions or expenditures for cumulative chart
    let runningTotal = 0
    return dates.map(date => {
        const matches = items.filter(d => d['Date Paid'] === date)
        runningTotal += sumAmount(matches)
        return {
            date: date,
            cumulative: runningTotal,
            type: type,
            party: candidate.party,
        }
    })
}
function totalByZipcode(contributions, candidate){
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
                candidate: candidate.last_name,
                party: candidate.party,
                zip: zip,
                amount: sumAmount(zipContributions),
                number: zipContributions.length,
                
            }
        })
}
function totalByType(contributions, candidate){
    const uniqueTypes = Array.from(new Set(contributions.map(d => d.type2)))
    return uniqueTypes.map(type => {
        const typeContributions = contributions.filter(d => d.type2 === type)
        return {
            candidate: candidate.last_name,
            party: candidate.party,
            type: type,
            amount: sumAmount(typeContributions),
            number: typeContributions.length,
        }
    })
}
function summarizeByCandidate(contributions, expenditures){
    // Prep values for pull stats by candidate
    const totalRaised = sumAmount(contributions)
    const totalRaisedPrimary = sumAmount(forPrimary(contributions))
    const totalRaisedGeneral = sumAmount(forGeneral(contributions))
    const totalSpent = sumAmount(expenditures)

    const individualContributions = contributions.filter(d => d.type2 === 'Individual donations')
    const numIndividualContributions = individualContributions.length
    const averageIndividualContributionSize = sumAmount(individualContributions) / numIndividualContributions

    const mtIndividualContributions = individualContributions
        .filter(d => d.State === 'MT')
    const percentIndividualFromMontana = sumAmount(mtIndividualContributions) / sumAmount(individualContributions)
    
    const reportingPeriods = Array.from(new Set(contributions.map(d => d['Reporting Period']))).sort()
    const firstReportingDate = Array.from(new Set(contributions.map(d => d.reporting_start))).sort()[0]
    const lastReportingDate = Array.from(new Set(contributions.map(d => d.reporting_end))).sort().slice(-1)[0]
    const numReportingPeriods = reportingPeriods.length
    
    return {
        totalRaised,
        totalRaisedPrimary,
        totalRaisedGeneral,
        totalSpent,

        numIndividualContributions,
        averageIndividualContributionSize,
        percentIndividualFromMontana,

        numReportingPeriods,
        firstReportingDate,
        lastReportingDate,
    }
}