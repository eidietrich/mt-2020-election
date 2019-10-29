import React from "react"

import ResponsiveVegaLite from '../library/ResponsiveVegaLite'
import PullStatMain from '../library/PullStatMain'
import PullStatSecondaryRow from '../library/PullStatSecondaryRow'

import {
    contributionTypesSpec,
    cumulativeCombinedSpec,
    contributionMapSpec
} from '../logic/chart-specs.js'

import {
    dollarFormat,
    percentFormat,
    numberFormat,
    dateFormat,
    fundraisingDomainUpperBound,
} from '../logic/config'

import { makeRaceKey } from '../logic/functions'

import styles from './CandidateFinance.module.css'

const CandidateFinance = (props) => {
    const {
        candidate,
        race
    } = props
    console.log(props)

    const jurisdiction = race.type

    const cumulativeCombined = candidate.finance.cumulativeContributions.concat(candidate.finance.cumulativeExpenditures)

    // inject data into graph specifications
    
    contributionTypesSpec.data.values = candidate.finance.contributionsByType
    
    cumulativeCombinedSpec.data = {values: cumulativeCombined}
    const byZip = candidate.finance.contributionsByZip
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
    // contributionMapSpec.title = "Individual contributions by Montana zip code"

    // set y-scales
    const upperBound = fundraisingDomainUpperBound[makeRaceKey(race)]
    cumulativeCombinedSpec.encoding.y.scale.domain = [0, upperBound]
    contributionMapSpec.layer[1].encoding.size.scale.domain = [0, upperBound / 10]
    // cumulativeContributionSpec.encoding.y.scale = { domain: totalSpendingDomain }
    // cumulativeExpendituresSpec.encoding.y.scale = { domain: totalSpendingDomain }

    // message for new candidates w/out campaign finance filings
    if (candidate.finance.numReportingPeriods === 0) {
        return (
            <div className={styles.container}>
                <h2>Campaign finance</h2>
                <div className={styles.note}>No campaign finance filings yet on file. Candidates generally file with the Federal Election Commission or Montana Commissioner of Political Practices on a quarterly basis.</div>
            </div>
        )
    }
    if (jurisdiction === 'state') {
        return <StateCandidateFinance
            candidate={candidate}
        />
    }

    if (jurisdiction === 'federal') {
        return <FederalCandidateFinance
            candidate={candidate}
        />
    }
}

export default CandidateFinance

const StateCandidateFinance = (props) => {
    const {
        candidate,
    } = props

    return <div className={styles.container}>
        <h2>Fundraising and campaign spending</h2>
        <div className={styles.note}>
            As a state candidate, {candidate.last_name} files campaign finance reports with the <a href="https://politicalpractices.mt.gov/">Montana Commissioner of Political Practices</a>. See the COPP <a href="https://camptrackext.mt.gov/CampaignTracker/dashboard">Campaign Electronic Reporting System</a> for official records. Data shown here is current through {dateFormat(new Date(candidate.finance.lastReportingDate))}.
        </div>

        <div className={styles.row}>
            <PullStatMain
                stat={dollarFormat(candidate.finance.totalRaised)}
                label='Total raised'
            />
            <PullStatSecondaryRow
                stats={[
                    {
                        stat: dollarFormat(candidate.finance.totalRaisedPrimary),
                        label: 'Raised for primary election'
                    },
                    {
                        stat: dollarFormat(candidate.finance.totalRaisedGeneral),
                        label: 'Raised for general election'
                    },
                    {
                        stat: dollarFormat(candidate.finance.totalSpent),
                        label: 'Total spending'
                    }
                ]}
            />
            {/* <PullStatMain
                stat={dollarFormat(candidate.finance.totalSpent)}
                label='Total spending'
            /> */}
        </div>
        
        {/* <div className={styles.row}>
            <div className={styles.oneThird}>
                <h4>Fundraising by source</h4>
                <ResponsiveVegaLite spec={contributionTypesSpec}/>
            </div>
            <div className={styles.twoThirds}>
                <h4>Cumulative fundraising</h4>
                <ResponsiveVegaLite spec={cumulativeCombinedSpec}/>
            </div>
        </div> */}
        <div className={styles.chartContainer}>
            <div className={styles.mapRow}>
                <h4>Contributions by zipcode</h4>
                <ResponsiveVegaLite
                    spec={contributionMapSpec}
                    aspectRatio={0.7}
                />
            </div>

        </div>
        
        <div className={styles.row}>
            <PullStatMain
                stat={percentFormat(candidate.finance.percentIndividualFromMontana)}
                label='Donors with Montana addresses'
            />

            <PullStatSecondaryRow
                stats={[
                    {
                        stat: numberFormat(candidate.finance.numIndividualContributions),
                        label: 'Individual contributions ($35+)'
                    },
                    {
                        stat: dollarFormat(candidate.finance.averageIndividualContributionSize),
                        label: 'Average contribution size'
                    },
                ]}
            />

            {/* <div className={styles.note}>
                Source: Campaign finance reports filed with the <a href="https://politicalpractices.mt.gov/">Montana Commissioner of Political Practices</a>. See the COPP-administered <a href="https://camptrackext.mt.gov/CampaignTracker/dashboard">Campaign Electronic Reporting System</a> for official records.
            </div> */}

        </div>
    
        {/* TK: List donations from political committees */}
    </div>

}

const FederalCandidateFinance = (props) => {
    const {
        candidate
    } = props
    const fecUrl = `https://www.fec.gov/data/candidate/${candidate.finance.federalCandidateId}/?cycle=2020&election_full=false`
    return <div className={styles.container}>
        <h2>Campaign finance</h2>
        <div className={styles.note}>As a federal candidate, {candidate.last_name} has a campaign committee that files financial reports with the <a href="https://www.fec.gov/">Federal Election Commission</a>. Data shown here, current through {dateFormat(new Date(candidate.finance.lastReportingDate))}, is pulled <a href={fecUrl}>from the FEC website</a> for the 2019-20 election cycle.</div>

        <div className={styles.row}>
            <PullStatMain
                stat={dollarFormat(candidate.finance.totalRaised)}
                label='Total raised'
            />
            {/* <PullStatSecondaryRow
                stats={[
                    // {
                    //     stat: dollarFormat(candidate.finance.totalRaisedPrimary),
                    //     label: 'Raised for primary election'
                    // },
                    // {
                    //     stat: dollarFormat(candidate.finance.totalRaisedGeneral),
                    //     label: 'Raised for general election'
                    // },
                    {
                        stat: dollarFormat(candidate.finance.totalSpent),
                        label: 'Total spending'
                    }
                ]}
            /> */}
            <PullStatMain
                stat={dollarFormat(candidate.finance.totalSpent)}
                label='Total spent'
            />
        </div>
        
        {/* <div className={styles.row}>
            <div className={styles.oneThird}>
                <h4>Fundraising by source</h4>
                <ResponsiveVegaLite spec={contributionTypesSpec}/>
            </div>
            <div className={styles.twoThirds}>
                <h4>Cumulative fundraising</h4>
                <ResponsiveVegaLite spec={cumulativeCombinedSpec}/>
            </div>
        </div> */}
        
        <div className={styles.chartContainer}>
            <div className={styles.mapRow}>
                <h4>Contributions by zipcode</h4>
                <ResponsiveVegaLite
                    spec={contributionMapSpec}
                    aspectRatio={0.7}
                />
            </div>

        </div>
        
        <div className={styles.row}>
            <PullStatMain
                stat={percentFormat(candidate.finance.percentIndividualFromMontana)}
                label='Donors with Montana addresses'
            />

            <PullStatSecondaryRow
                stats={[
                    {
                        stat: numberFormat(candidate.finance.numIndividualContributions),
                        label: 'Individual contributions reported'
                    },
                    {
                        stat: dollarFormat(candidate.finance.averageIndividualContributionSize),
                        label: 'Average contribution size'
                    },
                ]}
            />

        </div> 
    </div>
}