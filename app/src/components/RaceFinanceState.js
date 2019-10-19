import React from "react"

import ResponsiveVegaLite from '../library/ResponsiveVegaLite'
import PullStatMain from '../library/PullStatMain'
import PullStatSecondaryRow from '../library/PullStatSecondaryRow'

import {
    raceMapSpec,
    contributionBreakdownSpec
} from '../logic/chart-specs.js'

import {
    dollarFormat,
    fundraisingDomainUpperBound
} from '../logic/config'

import {
    candidateNameParty,
    makeRaceKey
} from '../logic/functions'

const contributionTypes = {
    selfFinance: ['Personal contributions','Loans'],
    committee: ['PAC contributions','Political party contributions','Incidental committee contributions','Other political committee contributions'],
    individual: ['Individual contributions'],
    other: ['Unitemized contributions','Fundraisers & misc']
}

const forPrimary = contributions => contributions.filter(d => d['Election Type'] === 'PM')
const forGeneral = contributions => contributions.filter(d => d['Election Type'] === 'GN')

const sumAmount = entries => entries.reduce((acc, obj) => obj['Amount'] + acc, 0)

const CampaignFinanceState = (props) => {
    const {
        candidates,
        race
    } = props
    console.log(props)

    let contributions = []
    candidates.forEach(candidate => {
        const candContributions = candidate.stateContributions
        // byZipForCandidate.forEach(d => d.candidate = candidateNameParty(candidate))
        contributions = contributions.concat(candContributions)
    })

    let contributionsByZip = []
    candidates.forEach(candidate => {
        const byZipForCandidate = candidate.fundraisingSummary.contributionsByZip
        byZipForCandidate.forEach(d => d.candidate = candidateNameParty(candidate))
        contributionsByZip = contributionsByZip.concat(byZipForCandidate)
    })
    console.log(contributions)

    contributionBreakdownSpec.data.values = contributions
    contributionBreakdownSpec.height = 20 * candidates.length + 100
    const upperBound = fundraisingDomainUpperBound[makeRaceKey(race)]
    contributionBreakdownSpec.encoding.x.scale.domain = [0, upperBound]

    // This is going to take some more work
    // raceMapSpec.layer[1].encoding.data.values.zips.forEach

    return <div style={{maxWidth: 1200, width: '100%', border: '1px solid red'}}>
            <h2>Fundraising</h2>
            <div>TK Chart: fundraising broken down by type</div>
            <ResponsiveVegaLite spec={contributionBreakdownSpec} />
            <div>TK Chart: fundraising over time</div>
            

            <div className="note">
                Notes: Figures from data as reported to the Montana Commissioner of Political Practices by campaigns. TK other caveats - no refunds factored in yet, mention what contribution limits are
            </div>
            
        </div>
}

export default CampaignFinanceState

