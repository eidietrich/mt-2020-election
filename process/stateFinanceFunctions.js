const {min, max, sum} = require('d3-array')

const {
    reportingPeriodDict,
    contributionLimitsByOffice
} = require('./config.js')

const {
    getDaysArray,
    sumAmount,
    // forGeneral,
    // forPrimary,
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

    // exclude in-kind contributions
    cashContributions = contributions.filter(d => d['Amount Type'] === 'CA')
    return cashContributions
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
        const reportingPeriodsNotInConfig = reportingPeriods.filter(d => !Object.keys(reportingPeriodDict).includes(d))
        if (reportingPeriodsNotInConfig.length > 0){
            console.warn("\x1b[33m", '\nUncategorized state reporting periods in process/config:\n',
                reportingPeriodsNotInConfig
            )
        }
        const reportingPeriodCounts = {}
        reportingPeriods.forEach(key => {
            const quarter = reportingPeriodDict[key]
            const recordCount = matches.filter(d => d['Reporting Period'] === key).length 
            reportingPeriodCounts[quarter] = recordCount
        })
        // const reportingStarts = Array.from(new Set(matches.map(d => d.reporting_start))).sort()
        // const reportingEnds = Array.from(new Set(matches.map(d => d.reporting_end))).sort()
        return {
            name,
            records: matches.length,
            periods: reportingPeriods.length,
            // first_period: reportingEnds[0],
            // last_period: reportingEnds.slice(-1)[0],
            ...reportingPeriodCounts,
        }
    })
    console.log('\n### State candidate reporting periods:')
    console.table(check)
}

module.exports.makeStateCandidateSummaries = function (candidates, allSummaryTotals, allItemizedContributions, allItemizedExpenditures){
    const candidateSummaries = candidates.map(candidate => {

        // TODO - clean whitespace in data prep step so .trim() isn't necessary here
        const summaryTotals = allSummaryTotals.find(d => d.candidateName.trim() === candidate.state_finance_data_name)
        const itemizedContributions = allItemizedContributions.filter(d => d.Candidate === candidate.state_finance_data_name)
        const itemizedExpenditures = allItemizedExpenditures.filter(d => d.Candidate === candidate.state_finance_data_name)
        const summaries = summarizeByCandidate(summaryTotals, itemizedContributions, itemizedExpenditures)
        const firstDate = min(itemizedContributions.concat(itemizedExpenditures), d => new Date(d['Date Paid']))
        const lastDate = max(itemizedContributions.concat(itemizedExpenditures), d => new Date(d.reporting_end))
        const dates = getDaysArray(new Date(firstDate), new Date(lastDate)).map(d => dateFormat(d))
        const cumulativeContributions = runningTotalByDate(dates, itemizedContributions, 'Fundraising', candidate)
        const cumulativeExpenditures = runningTotalByDate(dates, itemizedExpenditures, 'Spending', candidate)
        const contributionsByZip = totalByZipcode(itemizedContributions, candidate)
        const contributionsByType = totalByType(itemizedContributions, candidate)

        // testing
        if ((itemizedContributions.length > 0) && cumulativeContributions.length == 0) {
            console.log('contribution running total error', candidate.state_finance_data_name)
        }
        

        // console.log(candidate.state_finance_data_name, , cumulativeContributions.length)

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
    // check that each item in 
    const unmatches = items.filter(d => !dates.includes(d['Date Paid']))
    return dates.map((date, i) => {
        const matches = items.filter(d => d['Date Paid'] === date)
        runningTotal += sumAmount(matches)
        if (i+1 === dates.length) runningTotal += sumAmount(unmatches) // add unmatched contributions on last day
        return {
            date: date,
            cumulative: Math.round(runningTotal), // Be sure to round once
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
function summarizeByCandidate(summary, contributions, expenditures){
    // Prep values for pull stats by candidate
    if (!summary) console.log("A candidate is missing from state summary data...")
    const totalRaised = (summary && summary.receipts) || 0
    const totalSpent = (summary && summary.expenditures) || 0
    

    const officeTitle = summary && summary.officeTitle

    if (summary && !officeTitle in contributionLimitsByOffice) console.log('Missing office title', officeTitle)
    const contributionLimit = contributionLimitsByOffice[officeTitle]

    // TODO: Add cash on hand

    // spending breakdown
    const itemizedIndividual = sumAmount(contributions.filter(d => d.type2 === 'Individual donations'))
    const itemizedCommittees = sumAmount(contributions.filter(d => d.type2 === 'Committee support'))
    const itemizedSelfFinance = sumAmount(contributions.filter(d => d.type2 === 'Self financing'))
    const unitemized = totalRaised - itemizedIndividual - itemizedCommittees - itemizedSelfFinance

    if (unitemized < 0) console.log('WARN: unitemized remainder:\n',
     summary,
     '\nI:', itemizedIndividual,
     '\nC:', itemizedCommittees,
     '\nS:', itemizedSelfFinance,
     '\nU:', unitemized,
    )

    const individualContributions = contributions.filter(d => d.type2 === 'Individual donations')
    const numIndividualContributions = individualContributions.length
    // const averageIndividualContributionSize = sumAmount(individualContributions) / numIndividualContributions
    const numIndividualContributionsAtLimit = individualContributions.filter(d => d.Amount >= contributionLimit).length

    const mtIndividualContributions = individualContributions
        .filter(d => d.State === 'MT')
    const percentIndividualFromMontana = sumAmount(mtIndividualContributions) / sumAmount(individualContributions)
    
    const reportingPeriods = Array.from(new Set(contributions.map(d => d['Reporting Period']))).sort()
    const firstReportingDate = Array.from(new Set(contributions.map(d => d.reporting_start))).sort()[0]
    const lastReportingDate = Array.from(new Set(contributions.map(d => d.reporting_end))).sort().slice(-1)[0]
    const numReportingPeriods = reportingPeriods.length
    
    return {
        totalRaised: Math.round(totalRaised),
        // totalRaisedPrimary: Math.round(totalRaisedPrimary),
        // totalRaisedGeneral: Math.round(totalRaisedGeneral),
        totalSpent: Math.round(totalSpent),

        testSum: sum(contributions, d => d['Amount']),

        itemizedIndividual, 
        itemizedCommittees, 
        itemizedSelfFinance,
        unitemized,

        numIndividualContributions,
        numIndividualContributionsAtLimit,
        // averageIndividualContributionSize,
        percentIndividualFromMontana,

        numReportingPeriods,
        firstReportingDate,
        lastReportingDate,

        contributionLimit,
    }
}

module.exports.checkStateCandidateFundraising = function(summaries) {
    summaries.forEach(summary => {
        
        /// Check that sums from running totals and overall totals match
        const runningTotalSum = summary.cumulativeContributions.slice(-1)[0]
        if (!runningTotalSum) return null
        if (runningTotalSum.cumulative !== summary.totalRaised) {
            console.log('Sum mismatch', summary.key)
            console.log('Running total sum:', runningTotalSum.cumulative)
            console.log('Summary total sum:', summary.totalRaised)
        }
    })
}