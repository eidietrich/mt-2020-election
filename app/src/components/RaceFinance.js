import React from "react"

import ResponsiveVegaLite from '../library/ResponsiveVegaLite'
import PullStatMain from '../library/PullStatMain'
// import PullStatSecondaryRow from '../library/PullStatSecondaryRow'

import {
    raceCumulativeContributionSpec,
    // raceCumulativeExpenditureSpec,
    contributionTypesSpec,
} from '../logic/chart-specs.js'

import {
    dollarFormat,
    dateFormat,
    fundraisingDomainUpperBound,
} from '../logic/config'

import {
    makeRaceKey,
} from '../logic/functions'

import styles from './RaceFinance.module.css'

const RaceFinance = (props) => {
    const {
        candidates,
        race
    } = props
    const jurisdiction = race.type
    // console.log(props)

    // aggregate data 
    const cumulativeContributions = candidates
        .reduce((acc, candidate) => {
            const items = candidate.fundraisingSummary.cumulativeContributions
            items.forEach(d => d.candidate = candidate.last_name)
            return acc.concat(items)
        }, [])

    let contributionsByType = []
    candidates.forEach(candidate => {
        let candContributions = candidate.fundraisingSummary.contributionsByType 
        const forNoDonations = {
            candidate: candidate.last_name,
            party: candidate.party,
            type: 'Other support', amount: 0
        }
        if (candContributions.length === 0) candContributions = forNoDonations
        // byZipForCandidate.forEach(d => d.candidate = candidateNameParty(candidate))
        contributionsByType = contributionsByType.concat(candContributions)
    })

    // const cumulativeExpenditures = candidates
    //     .reduce((acc, candidate) => {
    //         const items = candidate.fundraisingSummary.cumulativeExpenditures
    //         items.forEach(d => d.candidate = candidate.last_name)
    //         return acc.concat(items)
    //     }, [])

    const totalFundraising = candidates.reduce((acc, candidate) => acc + candidate.fundraisingSummary.totalRaised, 0)
    const totalSpending = candidates.reduce((acc, candidate) => acc + candidate.fundraisingSummary.totalSpent, 0)

    // inject data for line charts
    const upperBound = fundraisingDomainUpperBound[makeRaceKey(race)]
    // line charts
    raceCumulativeContributionSpec.data.values = cumulativeContributions
    raceCumulativeContributionSpec.layer[0].encoding.y.scale.domain = [0, upperBound]
    // raceCumulativeExpenditureSpec.data.values = cumulativeExpenditures
    // raceCumulativeExpenditureSpec.layer[0].encoding.y.scale.domain = [0, upperBound]

    // inject data for bar chart
    contributionTypesSpec.data.values = contributionsByType
    contributionTypesSpec.height = 30 * candidates.length + 120
    contributionTypesSpec.layer[0].encoding.x.scale.domain = [0, upperBound]

    if (jurisdiction === 'federal') {
        return <div className={styles.container}>
            <h2>Campaign finance</h2>
            <div className={styles.note}>Check back — campaign finance data for federal candidates not yet included here.</div>
        </div>
    }

    // pull update date from most recent candidate
    const updateDate = new Date(candidates[0].fundraisingSummary.lastReportingDate)
    const noReportsFor = candidates.filter(d => d.fundraisingSummary.numReportingPeriods === 0)

    return <div className={styles.container}>
            <h2>Campaign finance</h2>

            <div className={styles.note}>
                <p>
                    As reported in quarterly filings. Data current through {dateFormat(updateDate)}.
                    {noReportsFor.map((d, i) => <span key={String(i)}> No reports yet on file for {d.first_name} {d.last_name}.</span>)}
                </p>
            </div>

            <div className={styles.row}>
                <PullStatMain
                    stat={dollarFormat(totalFundraising)}
                    label='Total raised in race'
                />
                <PullStatMain
                    stat={dollarFormat(totalSpending)}
                    label='Total spent'
                />
            </div>

            <div className={styles.chartContainer}>
                <h4>Cumulative fundraising</h4>
                <ResponsiveVegaLite spec={raceCumulativeContributionSpec} />
            </div>
            
            <div className={styles.chartContainer}>
                <h4>Funding sources</h4>
                <ResponsiveVegaLite spec={contributionTypesSpec} />
            </div>
            

            {/* <div>
                <h4>Cumulative spending</h4>
                <ResponsiveVegaLite spec={raceCumulativeExpenditureSpec} />
            </div> */}
            

            {(jurisdiction === 'state') ?
                <div className={styles.note}>
                    Source: Quarterly campaign finance reports filed with the <a href="https://politicalpractices.mt.gov/">Montana Commissioner of Political Practices</a>. See the COPP-administered <a href="https://camptrackext.mt.gov/CampaignTracker/dashboard">Campaign Electronic Reporting System</a> for official records.
                </div> : null
            }
            {(jurisdiction === 'federal') ?
                <div className={styles.note}>
                    Source: Quarterly campaign finance reports filed with the <a href="https://www.fec.gov/">Federal Election Commission</a>.
                </div> : null
            }
            
        </div>
}

export default RaceFinance

