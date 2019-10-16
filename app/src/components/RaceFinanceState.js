import React from "react"

import ResponsiveVegaLite from '../library/ResponsiveVegaLite'
import PullStatMain from '../library/PullStatMain'
import PullStatSecondaryRow from '../library/PullStatSecondaryRow'

import {
    cumulativeContributionSpec,
    cumulativeExpendituresSpec,
    contributionBreakdownSpec,
    cumulativeCombinedSpec,
} from '../logic/chart-specs.js'

import { dollarFormat } from '../logic/config'

const contributionTypes = {
    selfFinance: ['Personal contributions','Loans'],
    committee: ['PAC contributions','Political party contributions','Incidental committee contributions','Other political committee contributions'],
    individual: ['Individual contributions'],
    other: ['Unitemized contributions','Fundraisers & misc']
}
const totalSpendingDomain = [0,600000] // TODO Set this by race

const forPrimary = contributions => contributions.filter(d => d['Election Type'] === 'PM')
const forGeneral = contributions => contributions.filter(d => d['Election Type'] === 'GN')

const sumAmount = entries => entries.reduce((acc, obj) => obj['Amount'] + acc, 0)

const CampaignFinanceState = (props) => {
    const {
        candidates
    } = props
    console.log(props)

    
    // // cleaning - TODO move this to development script
    // contributions.forEach(d => {
    //     if (contributionTypes.selfFinance.includes(d.type)) d.type2 = 'Self financing'
    //     if (contributionTypes.committee.includes(d.type)) d.type2 = 'Committee support'
    //     if (contributionTypes.individual.includes(d.type)) d.type2 = 'Individual donations'
    //     if (contributionTypes.other.includes(d.type)) d.type2 = 'Other support'
    //     d.direction = 'contribution'
    // })
    // expenditures.forEach(d => {
    //     d.direction = 'expenditure'
    // })

    // // TODO: Elegentize this
    // const reportingPeriods = Array.from(new Set(contributions.map(d => d['Reporting Period'])))

    // // Prep values for display
    // const totalRaised = sumAmount(contributions)
    // const totalRaisedPrimary = sumAmount(forPrimary(contributions))
    // const totalRaisedGeneral = sumAmount(forGeneral(contributions))
    // const totalSpent = sumAmount(expenditures)

    // const individualContributions = contributions.filter(d => d.type2 === 'Individual donations')
    // const numIndividualContributions = individualContributions.length
    // const averageIndividualContributionSize = sumAmount(individualContributions) / numIndividualContributions

    // // prep data for graphs
    // contributionBreakdownSpec.data = {values: contributions} 
    // cumulativeContributionSpec.data = {values: contributions}
    // cumulativeExpendituresSpec.data = {values: expenditures}

    // // set y-scales
    // // cumulativeContributionSpec.encoding.y.scale = { domain: totalSpendingDomain }
    // // cumulativeExpendituresSpec.encoding.y.scale = { domain: totalSpendingDomain }

    return <div style={{maxWidth: 1200, width: '100%', border: '1px solid red'}}>
            <div>**Campaign Finance State**</div>
            <div className="note">
                Notes: Figures from data as reported to the Montana Commissioner of Political Practices by campaigns. TK other caveats - no refunds factored in yet, mention what contribution limits are
            </div>
            
        </div>
}

export default CampaignFinanceState

