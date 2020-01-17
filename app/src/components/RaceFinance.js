import React from "react"
import { Link } from 'gatsby'

import ResponsiveVegaLite from '../library/ResponsiveVegaLite'
import PullStatMain from '../library/PullStatMain'
import Table from '../library/Table'

import {
    raceCumulativeContributionSpec,
} from '../logic/chart-specs.js'

import {
    dollarFormat,
    dateFormat,
    fundraisingDomainUpperBound,
} from '../logic/config'

import {
    makeRaceKey,
    candidateNameParty,
    getCandidateParty,
    makeCandidateUrl
} from '../logic/functions'

import {
    racePageFundraisingStateCaveat,
    racePageFundraisingFederalCaveat,
} from '../data/app-copy.json'

import styles from './RaceFinance.module.css'

const RaceFinance = (props) => {
    const {
        candidates,
        race
    } = props

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
    
    const totalFundraising = candidates.reduce((acc, candidate) => acc + candidate.finance.totalRaised, 0)
    const totalSpending = candidates.reduce((acc, candidate) => acc + candidate.finance.totalSpent, 0)

    // inject data for line charts
    const upperBound = fundraisingDomainUpperBound[makeRaceKey(race)]
    // line chart
    raceCumulativeContributionSpec.data.values = cumulativeContributions
    raceCumulativeContributionSpec.layer[0].encoding.y.scale.domain = [0, upperBound]
    raceCumulativeContributionSpec.layer[3].data.values = latestForEachCandidate // for labels

    if (race.type === 'state') {
        return <StateRaceFinance 
            candidates={candidates}
            totalSpending={totalSpending}
            totalFundraising={totalFundraising}
            raceCumulativeContributionSpec={raceCumulativeContributionSpec}
            text = {{
                racePageFundraisingStateCaveat
            }}
        />
    }

    if (race.type === 'federal') {
        return <FederalRaceFinance 
            candidates={candidates}
            totalSpending={totalSpending}
            totalFundraising={totalFundraising}
            raceCumulativeContributionSpec={raceCumulativeContributionSpec}
            text = {{
                racePageFundraisingFederalCaveat
            }}
        />
    }
}

export default RaceFinance

const tableSchematicState = [
    {
        key: 'name',
        header: 'Candidate',
        content: d => <Link to={makeCandidateUrl(d)}
            style={({color: getCandidateParty(d).color})}
        >
            {candidateNameParty(d)}
        </Link>,
        style: styles.tableCellCandidate,
        sortFunction: null
    },
    {
        key: 'totalRaised',
        header: 'Total raised',
        content: d => dollarFormat(d.finance.totalRaised),
        style: styles.tableCellNumberImportant,
        sortFunction: (a,b) => (a.finance.totalRaised - b.finance.totalRaised)
    },
    {
        key: 'individual',
        header: 'Itemized individual contributions',
        content: d => dollarFormat(d.finance.itemizedIndividual),
        style: styles.tableCellNumber,
        sortFunction: (a,b) => (a.finance.itemizedIndividual - b.finance.itemizedIndividual)
    },
    {
        key: 'pac',
        header: 'Committee contributions',
        content: d => dollarFormat(d.finance.itemizedCommittees),
        style: styles.tableCellNumber,
        sortFunction: (a,b) => (a.finance.itemizedCommittees - b.finance.itemizedCommittees)
    },
    {
        key: 'self',
        header: 'Self-financing',
        content: d => dollarFormat(d.finance.itemizedSelfFinance),
        style: styles.tableCellNumber,
        sortFunction: (a,b) => (a.finance.itemizedSelfFinance - b.finance.itemizedSelfFinance)
    },
    {
        key: 'self',
        header: 'Unitemized contributions',
        content: d => dollarFormat(d.finance.unitemized),
        style: styles.tableCellNumber,
        sortFunction: (a,b) => (a.finance.unitemized - b.finance.unitemized)
    },
]

const StateRaceFinance = (props) => {
    const { 
        candidates,
        totalSpending,
        totalFundraising,
        raceCumulativeContributionSpec,
        text
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

        {/* <div className={styles.chartContainer}>
            <h4>Cumulative fundraising</h4>
            <ResponsiveVegaLite spec={raceCumulativeContributionSpec} />
        </div> */}

        <div className={styles.tableContainer}>
            <Table 
                defaultSort={((a,b) => b.finance.totalRaised - a.finance.totalRaised)}
                columns={tableSchematicState}
                rowData={candidates}
            />
            <div className={styles.note}>
                {text.racePageFundraisingStateCaveat}
            </div>
        </div>
        
        <div className={styles.note}>
            Source: Campaign finance reports filed with the <a href="https://politicalpractices.mt.gov/">Montana Commissioner of Political Practices</a>. See the COPP-administered <a href="https://camptrackext.mt.gov/CampaignTracker/dashboard">Campaign Electronic Reporting System</a> for official records.
        </div>
    </div>
}

const tableSchematicFederal = [
    {
        key: 'name',
        header: 'Candidate',
        content: d => <Link to={makeCandidateUrl(d)}
            style={({color: getCandidateParty(d).color})}
        >
            {candidateNameParty(d)}
        </Link>,
        style: styles.tableCellCandidate,
        sortFunction: null
    },
    {
        key: 'totalRaised',
        header: 'Total raised',
        content: d => dollarFormat(d.finance.totalRaised),
        style: styles.tableCellNumberImportant,
        sortFunction: (a,b) => (a.finance.totalRaised - b.finance.totalRaised)
    },
    {
        key: 'individual',
        header: 'Individual contributions',
        content: d => dollarFormat(d.finance.totalIndividual),
        style: styles.tableCellNumber,
        sortFunction: (a,b) => (a.finance.totalIndividual - b.finance.totalIndividual)
    },
    {
        key: 'pac',
        header: 'Committee contributions',
        content: d => dollarFormat(d.finance.totalCommittees),
        style: styles.tableCellNumber,
        sortFunction: (a,b) => (a.finance.totalCommittees - b.finance.totalCommittees)
    },
    {
        key: 'self',
        header: 'Self-financing',
        content: d => dollarFormat(d.finance.totalSelfFinance),
        style: styles.tableCellNumber,
        sortFunction: (a,b) => (a.finance.totalSelfFinance - b.finance.totalSelfFinance)
    }
]

const FederalRaceFinance = (props) => {
    const { 
        candidates,
        totalSpending,
        totalFundraising,
        text
        // raceCumulativeContributionSpec,
    } = props
    console.log('text', text)
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

        {/* 
        // This is problematic because missing unitemized contributions are significant :^/
        <div className={styles.chartContainer}>
            <h4>Cumulative fundraising</h4>
            <ResponsiveVegaLite spec={raceCumulativeContributionSpec} />
            <div className={styles.note}>
                Includes only itemized receipts.
            </div>
        </div>
        */}

        <div className={styles.tableContainer}>
            <Table 
                defaultSort={((a,b) => b.finance.totalRaised - a.finance.totalRaised)}
                columns={tableSchematicFederal}
                rowData={candidates}
            />
            <div className={styles.note}>
                {text.racePageFundraisingFederalCaveat}
            </div>
        </div>
        
        <div className={styles.note}>
            Source: Campaign finance reports filed with the <a href="https://www.fec.gov/">Federal Election Commission</a>.
        </div>
    </div>
}