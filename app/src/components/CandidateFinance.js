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

    const cumulativeCombined = candidate.fundraisingSummary.cumulativeContributions.concat(candidate.fundraisingSummary.cumulativeExpenditures)

    // inject data into graph specifications
    
    contributionTypesSpec.data.values = candidate.fundraisingSummary.contributionsByType
    
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
    // contributionMapSpec.title = "Individual contributions by Montana zip code"

    // set y-scales
    const upperBound = fundraisingDomainUpperBound[makeRaceKey(race)]
    cumulativeCombinedSpec.encoding.y.scale.domain = [0, upperBound]
    contributionMapSpec.layer[1].encoding.size.scale.domain = [0, upperBound / 10]
    // cumulativeContributionSpec.encoding.y.scale = { domain: totalSpendingDomain }
    // cumulativeExpendituresSpec.encoding.y.scale = { domain: totalSpendingDomain }
    
    // TODO: Add in federal data
    if (jurisdiction === 'federal') {
        return <div className={styles.container}>
            <h2>Fundraising and campaign spending</h2>
            <div className={styles.note}>Check back — campaign finance data for federal candidates not yet included here.</div>
        </div>
    }

    // message for new candidates w/out campaign finance filings
    if (candidate.fundraisingSummary.numReportingPeriods === 0) {
        return (
            <div className={styles.container}>
                <h2>Fundraising and campaign spending</h2>
                <div className={styles.note}>No quarterly campaign finance filings yet on file.</div>
            </div>
        )
    }

    return <div className={styles.container}>
            <h2>Fundraising and campaign spending</h2>
            <div className={styles.note}>As reported in quarterly campaign finance filings. Data current through {dateFormat(new Date(candidate.fundraisingSummary.lastReportingDate))}.</div>

            <div className={styles.row}>
                <PullStatMain
                    stat={dollarFormat(candidate.fundraisingSummary.totalRaised)}
                    label='Total raised'
                />
                <PullStatSecondaryRow
                    stats={[
                        {
                            stat: dollarFormat(candidate.fundraisingSummary.totalRaisedPrimary),
                            label: 'Raised for primary election'
                        },
                        {
                            stat: dollarFormat(candidate.fundraisingSummary.totalRaisedGeneral),
                            label: 'Raised for general election'
                        },
                        {
                            stat: dollarFormat(candidate.fundraisingSummary.totalSpent),
                            label: 'Total spending'
                        }
                    ]}
                />
                {/* <PullStatMain
                    stat={dollarFormat(candidate.fundraisingSummary.totalSpent)}
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
                    stat={percentFormat(candidate.fundraisingSummary.percentIndividualFromMontana)}
                    label='Donors with Montana addresses'
                />

                
                
                <PullStatSecondaryRow
                    stats={[
                        {
                            stat: numberFormat(candidate.fundraisingSummary.numIndividualContributions),
                            label: 'Individual contributions ($35+)'
                        },
                        {
                            stat: dollarFormat(candidate.fundraisingSummary.averageIndividualContributionSize),
                            label: 'Average contribution size'
                        },
                    ]}
                />

                
            </div>
            
            
            
            

            {/* TK: List donations from political committees */}
            
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

export default CandidateFinance

