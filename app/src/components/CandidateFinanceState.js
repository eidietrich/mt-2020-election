import React from "react"

import ResponsiveVegaLite from '../library/ResponsiveVegaLite'
import PullStatMain from '../library/PullStatMain'
import PullStatSecondaryRow from '../library/PullStatSecondaryRow'

import {
    contributionBreakdownSpec,
    cumulativeCombinedSpec,
    contributionMapSpec
} from '../logic/chart-specs.js'

import { dollarFormat, fundraisingDomainUpperBound, raceTypes,  } from '../logic/config'

import { makeRaceKey } from '../logic/functions'

import styles from './CandidateFinance.module.css'

const CandidateFinanceState = (props) => {
    const {
        candidate,
        race
    } = props
    console.log(props)

    const cumulativeCombined = candidate.fundraisingSummary.cumulativeContributions.concat(candidate.fundraisingSummary.cumulativeExpenditures)

    // inject data into graph specifications
    
    // contributionBreakdownSpec.data = {values: contributions} 
    
    cumulativeCombinedSpec.data = {values: cumulativeCombined}
    const byZip = candidate.fundraisingSummary.contributionsByZip
    // TODO add warning for missed zip matches
    contributionMapSpec.layer[1].data.values.forEach(zip => {
        const match = byZip.find(d => zip.zip_code === d.zip)
        if (match) {
            zip.amount = match.amount
            zip.number = match.number
        } else {
            zip.amount = 0
            zip.number = 0
        }
    })
    contributionMapSpec.title = "Individual contributions by Montana zip code"

    // set y-scales
    const upperBound = fundraisingDomainUpperBound[makeRaceKey(race)]
    cumulativeCombinedSpec.encoding.y.scale.domain = [0, upperBound]
    contributionMapSpec.layer[1].encoding.size.scale.domain = [0, upperBound / 10]
    // cumulativeContributionSpec.encoding.y.scale = { domain: totalSpendingDomain }
    // cumulativeExpendituresSpec.encoding.y.scale = { domain: totalSpendingDomain }

    return <div style={{maxWidth: 1200, width: '100%', border: '1px solid red'}}>
            <h2>Fundraising and campaign spending</h2>
            <div>Reporting periods: {'TK'}</div>
 
            <PullStatMain
                stat={dollarFormat(candidate.fundraisingSummary.totalRaised)}
                label='Total raised'
            />
            <PullStatSecondaryRow
                stats={[
                    {
                        stat: dollarFormat(candidate.fundraisingSummary.totalRaisedPrimary),
                        label: 'Raised for primary'
                    },
                    {
                        stat: dollarFormat(candidate.fundraisingSummary.totalRaisedGeneral),
                        label: 'Raised for general election'
                    },
                ]}
            />
            <PullStatMain
                stat={dollarFormat(candidate.fundraisingSummary.totalSpent)}
                label='Total spending'
            />
            <ResponsiveVegaLite spec={cumulativeCombinedSpec}/>
            
            <h3>Where the campaign budget is coming from</h3>
            {/* <ResponsiveVegaLite spec={contributionBreakdownSpec}/> */}
            <div>TK: % from within Montana</div>
            <ResponsiveVegaLite spec={contributionMapSpec}/>
            <div>TK: Political committee donations</div>
            
            <PullStatSecondaryRow
                stats={[
                    {
                        stat: candidate.fundraisingSummary.numIndividualContributions,
                        label: 'Number of individual contributions ($35+)'
                    },
                    {
                        stat: dollarFormat(candidate.fundraisingSummary.averageIndividualContributionSize),
                        label: 'Average individual contribution size'
                    },
                ]}
            />

            <div className={styles.note}>
                Notes: Figures from data as reported to the Montana Commissioner of Political Practices by campaigns. TK other caveats - no refunds factored in yet, mention what contribution limits are
            </div>
            
        </div>
}

export default CandidateFinanceState

