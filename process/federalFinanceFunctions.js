const { sum, min } = require('d3-array')

const {
    getJson,
    makeCandidateKey,
    getDaysArray,
    dateFormat,
} = require('./functions.js')

/*
Need to match state candidate summaries of form
{
    key: 'Nelly-Nicol',
    totalRaised: 0,
    totalRaisedPrimary: 0,
    totalRaisedGeneral: 0,
    totalSpent: 0,
    numIndividualContributions: 0,
    averageIndividualContributionSize: NaN,
    percentIndividualFromMontana: NaN,
    numReportingPeriods: 0,
    firstReportingDate: undefined,
    lastReportingDate: undefined,
    cumulativeContributions: [],
    cumulativeExpenditures: [],
    contributionsByZip: [],
    contributionsByType: []
}
*/

const candidateInfoList = getJson('./scrapers/fed-finance-reports/data/candidates.json')




// EXPORT FUNCTIONS

module.exports.checkFederalCandidateMatches = function (candidates, federalCampaignTotals){
    const federalFinanceDataNames = Array.from(new Set(federalCampaignTotals.map(d => d['CAND_NAME'])))
    const missingMatches = candidates
        .filter(d => !(federalFinanceDataNames.includes(d.fed_finance_data_name)))
    console.log('\n### No federal finance data for:', missingMatches.map(d => `${d.last_name}, ${d.first_name} (Fed:${d.fed_finance_data_name})`))
}

module.exports.makeFederalCandidateSummaries = function (candidates, fundraisingSummaries, contributions, expenditures){
    const candidateSummaries = candidates.map(candidate => {
        
        // const candidateExpenditures = expenditures.filter(d => d.Candidate === candidate.state_finance_data_name)
        const fundraisingSummary = fundraisingSummaries.find(d => d['CAND_NAME'] === candidate.fed_finance_data_name) || {}
        const candidateInfo = candidateInfoList.find(d => d['CAND_NAME'] === candidate.fed_finance_data_name) || {}
        // console.log(fundraisingSummary)

        const committeeId = candidateInfo.CAND_PCC || null
        const candidateContributions = contributions.filter(d => d.committee_id === committeeId)
        const individualContributions = candidateContributions.filter(d => d.entity_type == 'IND')
        const itemizedIndividualTotal = sum(individualContributions, d => d.contribution_receipt_amount)
        const individualFromMontana = individualContributions.filter(d => d.contributor_state == 'MT')
        const individualFromMontanaTotal = sum(individualFromMontana, d => d.contribution_receipt_amount)
        const percentIndividualFromMontana = individualFromMontanaTotal / itemizedIndividualTotal
        // console.log(candidate.last_name, itemizedIndividualTotal)
        // console.log(candidate.last_name, fundraisingSummary.CAND_ID, committeeId, candidateContributions.length)
        
        const firstDate = min(candidateContributions, d => d.contribution_receipt_date)
        const lastDate = fundraisingSummary.CVG_END_DT
        const dates = getDaysArray(new Date(firstDate), new Date(lastDate)).map(d => dateFormat(d))

        const summaries = {
            federalCandidateId: fundraisingSummary.CAND_ID || null,
            federalCandidateCommitteeId: committeeId,
            totalRaised: fundraisingSummary.TTL_RECEIPTS || 0,
            

            totalIndividual: fundraisingSummary.TTL_INDIV_CONTRIB || 0,
            totalCommittees: (fundraisingSummary.POL_PTY_CONTRIB + fundraisingSummary.OTHER_POL_CMTE_CONTRIB + fundraisingSummary.TRANS_FROM_AUTH) || 0,
            totalSelfFinance: (fundraisingSummary.CAND_CONTRIB + fundraisingSummary.CAND_LOANS) || 0, //


            totalRaisedPrimary: null, // NOT IN FEC SUMMARY, sums won't match calculated from itemized
            totalRaisedGeneral: null, // NOT IN FEC SUMMARY
            totalSpent: fundraisingSummary.TTL_DISB || 0,

            numIndividualContributions: individualContributions.length, // TK from itemized 
            averageIndividualContributionSize: itemizedIndividualTotal / individualContributions.length, // TK from itemized
            percentIndividualFromMontana: percentIndividualFromMontana,
            numReportingPeriods: (fundraisingSummary.TTL_RECEIPTS ? 1 : 0), // TEMP - add actual value from itemized
            firstReportingDate: null, // NOT IN FEC SUMMARY
            lastReportingDate: fundraisingSummary.CVG_END_DT || 'None',
        }
        const cumulativeContributions = runningTotalByDate(dates, candidateContributions, 'Fundraising', candidate)
        const cumulativeExpenditures = [] // TK w/ itemized expenditure data
        const contributionsByZip = totalByZipcode(candidateContributions, candidate) 
        const contributionsByType = [] // TK w/ itemized data
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

function totalByZipcode(contributions, candidate){
    // individual contributions in Montana for each candidate
    // formatted for location map
    const mtIndividualContributions = contributions
        .filter(d => d.entity_type == 'IND')
        .filter(d => d.contributor_state === 'MT')
    const uniqueMTZips = Array.from(new Set(mtIndividualContributions.map(d => String(d.contributor_zip).substring(0,5))))
    // remove "bad" zips from data messiness
    // also trim anything zip with extra characters
    return uniqueMTZips
        .filter(zip => zip.substring(0,2) === '59')
        .map(zip => {
            const zipContributions = mtIndividualContributions.filter(d => String(d.contributor_zip).substring(0,5) === zip)
                return {
                candidate: candidate.last_name,
                party: candidate.party,
                zip: zip,
                amount: sum(zipContributions, d => d.contribution_receipt_amount),
                number: zipContributions.length,
                
            }
        })
}

function runningTotalByDate(dates, items, type, candidate){
    // combine contributions or expenditures for cumulative chart
    let runningTotal = 0
    return dates.map(date => {
        const matches = items.filter(d => dateFormat(new Date(d.contribution_receipt_date)) === dateFormat(new Date(date)))
        runningTotal += sum(matches, d => d.contribution_receipt_amount)
        return {
            candidate: candidate.last_name,
            date: date,
            cumulative: runningTotal,
            type: type,
            party: candidate.party,
        }
    })
}