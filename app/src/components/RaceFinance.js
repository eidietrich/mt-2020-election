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
    console.log(props)

    // aggregate data 
    const cumulativeContributions = candidates
        .reduce((acc, candidate) => {
            const items = candidate.finance.cumulativeContributions
            if (!items) return acc
            items.forEach(d => d.candidate = candidate.last_name)
            return acc.concat(items)
        }, [])
    const latestForEachCandidate = candidates.map(candidate => {
        if (!candidate.finance.cumulativeContributions) return undefined
        const items = candidate.finance.cumulativeContributions
            .sort((a,b) => new Date(b.date) - new Date(a.date))
        return items[0]
    }).filter( d => d !== undefined)
    console.log(latestForEachCandidate)

    let contributionsByType = []
    candidates.forEach(candidate => {
        let candContributions = candidate.finance.contributionsByType 
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
    //         const items = candidate.finance.cumulativeExpenditures
    //         items.forEach(d => d.candidate = candidate.last_name)
    //         return acc.concat(items)
    //     }, [])

    const totalFundraising = candidates.reduce((acc, candidate) => acc + candidate.finance.totalRaised, 0)
    const totalSpending = candidates.reduce((acc, candidate) => acc + candidate.finance.totalSpent, 0)

    // inject data for line charts
    const upperBound = fundraisingDomainUpperBound[makeRaceKey(race)]
    // line charts
    raceCumulativeContributionSpec.data.values = cumulativeContributions
    raceCumulativeContributionSpec.layer[0].encoding.y.scale.domain = [0, upperBound]
    raceCumulativeContributionSpec.layer[3].data.values = latestForEachCandidate // for labels
    // raceCumulativeExpenditureSpec.data.values = cumulativeExpenditures
    // raceCumulativeExpenditureSpec.layer[0].encoding.y.scale.domain = [0, upperBound]

    // inject data for bar chart
    contributionTypesSpec.data.values = contributionsByType
    contributionTypesSpec.height = 30 * candidates.length + 120
    contributionTypesSpec.layer[0].encoding.x.scale.domain = [0, upperBound]

    

    

    if (race.type === 'state') {
        return <StateRaceFinance 
            candidates={candidates}
            totalSpending={totalSpending}
            totalFundraising={totalFundraising}
            raceCumulativeContributionSpec={raceCumulativeContributionSpec}
        />
    }

    if (race.type === 'federal') {
        return <FederalRaceFinance 
            candidates={candidates}
            totalSpending={totalSpending}
            totalFundraising={totalFundraising}
            raceCumulativeContributionSpec={raceCumulativeContributionSpec}
        />
    }
}

export default RaceFinance

const StateRaceFinance = (props) => {
    const { 
        candidates,
        totalSpending,
        totalFundraising,
        raceCumulativeContributionSpec,
    } = props
    // pull update date from most recent candidate
    const updateDate = new Date(candidates[0].finance.lastReportingDate)
    const noReportsFor = candidates.filter(d => d.finance.numReportingPeriods === 0)

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

        {/* <div className={styles.chartContainer}>
            <h4>Funding sources</h4>
            <ResponsiveVegaLite spec={contributionTypesSpec} />
        </div> */}
        

        {/* <div>
            <h4>Cumulative spending</h4>
            <ResponsiveVegaLite spec={raceCumulativeExpenditureSpec} />
        </div> */}
        

        
        <div className={styles.note}>
            Source: Campaign finance reports filed with the <a href="https://politicalpractices.mt.gov/">Montana Commissioner of Political Practices</a>. See the COPP-administered <a href="https://camptrackext.mt.gov/CampaignTracker/dashboard">Campaign Electronic Reporting System</a> for official records.
        </div>
    </div>
}

const FederalRaceFinance = (props) => {
    const { 
        candidates,
        totalSpending,
        totalFundraising,
        raceCumulativeContributionSpec,
    } = props
    // pull update date from most recent candidate
    const updateDate = new Date(candidates[0].finance.lastReportingDate)
    const noReportsFor = candidates.filter(d => d.finance.numReportingPeriods === 0)

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
            <div className={styles.note}>
                Includes only itemized receipts.
            </div>
        </div>

        {/* <div className={styles.chartContainer}>
            <h4>Funding sources</h4>
            <ResponsiveVegaLite spec={contributionTypesSpec} />
        </div> */}
        

        {/* <div>
            <h4>Cumulative spending</h4>
            <ResponsiveVegaLite spec={raceCumulativeExpenditureSpec} />
        </div> */}
        

        
        <div className={styles.note}>
            Source: Campaign finance reports filed with the <a href="https://www.fec.gov/">Federal Election Commission</a>.
        </div>
    </div>
}