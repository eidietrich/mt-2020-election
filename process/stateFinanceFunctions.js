const {min, max} = require('d3-array')


const {
    getDaysArray,
    sumAmount,
    forGeneral,
    forPrimary,
    makeCandidateKey,
    dateFormat,
} = require('./functions.js')

const contributionTypes = {
    selfFinance: ['Personal contributions','Loans'],
    committee: ['PAC contributions','Political party contributions','Incidental committee contributions','Other political committee contributions'],
    individual: ['Individual contributions'],
    other: ['Unitemized contributions','Fundraisers & misc']
}

module.exports.cleanStateContributions = function (contributions) {
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

module.exports.cleanStateExpenditures = function (expenditures){
    return expenditures
}


module.exports.checkStateCandidateMatches = function (candidates, contributions){
    const stateFinanceDataNames = Array.from(new Set(contributions.map(d => d.Candidate)))
    const candidatesWithoutStateFinanceDataMatch = candidates
        // .filter(d => d.jurisdiction === 'state') // exclude federal candidates 
        .filter(d => !(stateFinanceDataNames.includes(d.state_finance_data_name)))
    console.log('\n### No state finance data for:', candidatesWithoutStateFinanceDataMatch.map(d => `${d.last_name}, ${d.first_name}: (State:${d.state_finance_data_name})`))
}
module.exports.checkStateReportingPeriodCompleteness = function (candidates, contributions){
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
    console.log('\n### State candidate reporting periods:')
    console.table(check)
}

module.exports.makeStateCandidateSummaries = function (candidates, contributions, expenditures){
    const candidateSummaries = candidates.map(candidate => {
        const candidateContributions = contributions.filter(d => d.Candidate === candidate.state_finance_data_name)
        const candidateExpenditures = expenditures.filter(d => d.Candidate === candidate.state_finance_data_name)
        const summaries = summarizeByCandidate(candidateContributions, candidateExpenditures)

        const firstDate = min(candidateContributions.concat(candidateExpenditures), d => d['Date Paid'])
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
    const uniqueMTZips = Array.from(new Set(mtIndividualContributions.map(d => String(d.Zip).substring(0,5))))
    // remove "bad" zips from data messiness
    // also trim anything zip with extra characters
    return uniqueMTZips
        .filter(zip => zip.substring(0,2) === '59')
        // .map(zip => zip.substring(0,5))
        .map(zip => {
            const zipContributions = mtIndividualContributions.filter(d => String(d.Zip).substring(0,5) === zip)
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

        totalIndividual: sumAmount(contributions.filter(d => d.type2 === 'Individual donations')),
        totalCommittees: sumAmount(contributions.filter(d => d.type2 === 'Committee support')),
        totalSelfFinance: sumAmount(contributions.filter(d => d.type2 === 'Self financing')),

        numIndividualContributions,
        averageIndividualContributionSize,
        percentIndividualFromMontana,

        numReportingPeriods,
        firstReportingDate,
        lastReportingDate,
    }
}