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

import {
    candidatePageFundraisingStateCaveat,
    candidatePageFundraisingFederalCaveat,
    candidatePageIndividualStateCaveat,
    candidatePageIndividualFederalCaveat
} from '../data/app-copy.json'

import styles from './CandidateFinance.module.css'

const contributionMapLabel = (candidate) => `Contributions by zip code: ${candidate.first_name} ${candidate.last_name} (${candidate.party})`

const CandidateFinance = (props) => {
    const {
        candidate,
        race
    } = props

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
    contributionMapSpec.layer[1].encoding.size.scale.domain = [0, upperBound / 20]
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
            text={{
                candidatePageFundraisingStateCaveat,
                candidatePageIndividualStateCaveat
            }}
        />
    }

    if (jurisdiction === 'federal') {
        return <FederalCandidateFinance
            candidate={candidate}
            text={{
                candidatePageFundraisingFederalCaveat,
                candidatePageIndividualFederalCaveat
            }}
        />
    }
}

export default CandidateFinance

const StateCandidateFinance = (props) => {
    const {
        candidate,
        text,
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
            
            <PullStatMain
                stat={dollarFormat(candidate.finance.totalSpent)}
                label='Total spending'
            />
        </div>

        <div className={styles.row}>
            <PullStatSecondaryRow
                stats={[
                    {
                        stat: dollarFormat(candidate.finance.itemizedIndividual),
                        label: 'Itemized individual contributions'
                    },
                    {
                        stat: dollarFormat(candidate.finance.itemizedCommittees),
                        label: 'From committees'
                    },
                    {
                        stat: dollarFormat(candidate.finance.itemizedSelfFinance),
                        label: 'Self-financing'
                    },
                    {
                        stat: dollarFormat(candidate.finance.unitemized),
                        label: 'Unitemized'
                    }
                ]}
            />
        </div>

        <div className={styles.note}>
            {text.candidatePageFundraisingStateCaveat}
        </div>
    
        <div className={styles.chartContainer}>
            <div className={styles.mapRow}>
                <h4>{contributionMapLabel(candidate)}</h4>
                <ResponsiveVegaLite
                    spec={contributionMapSpec}
                    aspectRatio={0.7}
                />
            </div>

        </div>
        
        <div className={styles.row}>
            <PullStatMain
                stat={percentFormat(candidate.finance.percentIndividualFromMontana)}
                label='Portion of itemized fundraising from Montana donors'
            />

            <PullStatSecondaryRow
                stats={[
                    {
                        stat: numberFormat(candidate.finance.numIndividualContributions),
                        label: 'Itemized individual contributions'
                    },
                    {
                        stat: numberFormat(candidate.finance.numIndividualContributionsAtLimit),
                        label: `Number at ${dollarFormat(candidate.finance.contributionLimit)} contribution limit`
                    },
                ]}
            />
        </div>
        <div className={styles.note}>
            {text.candidatePageIndividualStateCaveat}
        </div>
    </div>

}

const FederalCandidateFinance = (props) => {
    const {
        candidate,
        text
    } = props
    const fecUrl = `https://www.fec.gov/data/candidate/${candidate.finance.federalCandidateId}/?cycle=2020&election_full=false`
    console.log('lastReportingDate', candidate.finance.lastReportingDate)

    const itemizedReportingNote = candidate.finance.lastItemizedReportingDate ?
        `Map data current through ${dateFormat(new Date(candidate.finance.lastItemizedReportingDate))}. Official itemized data from the FEC can be unavailable for days or weeks following quarterly campaign filing deadlines.` :
        `No itemized data available from the FEC as of last election guide update. Official itemized data from the FEC can be unavailable for days or weeks following quarterly campaign filing deadlines.`
    
    const lastItemizedReportingDate = candidate.finance.lastItemizedReportingDate ? dateFormat(new Date(candidate.finance.lastItemizedReportingDate)) : 'No itemized data'
    console.log('lastItemizedReportingDate', lastItemizedReportingDate)

    return <div className={styles.container}>
        <h2>Campaign finance</h2>
        <div className={styles.note}>As a federal candidate, {candidate.last_name} has a campaign committee that files financial reports with the <a href="https://www.fec.gov/">Federal Election Commission</a>. Data shown here, current through {dateFormat(new Date(candidate.finance.lastReportingDate))}, is pulled <a href={fecUrl}>from the FEC website</a> for the 2019-20 election cycle.</div>

        <div className={styles.row}>
            <PullStatMain
                stat={dollarFormat(candidate.finance.totalRaised)}
                label='Total raised'
            />
            <PullStatMain
                stat={dollarFormat(candidate.finance.totalSpent)}
                label='Total spent'
            />
        </div>

        <div className={styles.row}>
            <PullStatSecondaryRow
                stats={[
                    {
                        stat: dollarFormat(candidate.finance.totalIndividual),
                        label: 'From individuals'
                    },
                    {
                        stat: dollarFormat(candidate.finance.totalCommittees),
                        label: 'From committees'
                    },
                    {
                        stat: dollarFormat(candidate.finance.totalSelfFinance),
                        label: 'Self-financing'
                    }
                ]}
            />
        </div>

        <div className={styles.note}>
            {text.candidatePageFundraisingFederalCaveat}
        </div>
        
        <div className={styles.chartContainer}>
            <div className={styles.mapRow}>
                <h4>{contributionMapLabel(candidate)}</h4>
                <ResponsiveVegaLite
                    spec={contributionMapSpec}
                    aspectRatio={0.7}
                />
            </div>

        </div>

        <div className={styles.note}>
            {itemizedReportingNote}
        </div>
        
        <div className={styles.row}>
            <PullStatMain
                stat={percentFormat(candidate.finance.percentIndividualFromMontana)}
                label='Portion of individual receipts from Montana'
            />

            <PullStatSecondaryRow
                stats={[
                    {
                        stat: numberFormat(candidate.finance.numIndividualContributions),
                        label: 'Itemized individual contributions reported'
                    },
                    {
                        stat: numberFormat(candidate.finance.numIndividualContributionsAtLimit),
                        label: `Number at ${dollarFormat(candidate.finance.contributionLimit)} contribution limit`
                    },
                    // {
                    //     stat: dollarFormat(candidate.finance.averageIndividualContributionSize),
                    //     label: 'Average contribution size'
                    // },
                ]}
            />

        </div> 
        <div className={styles.note}>
            {text.candidatePageIndividualFederalCaveat}
        </div>
    </div>
}