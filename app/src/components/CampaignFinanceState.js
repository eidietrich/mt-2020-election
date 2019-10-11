import React from "react"

// import { VegaLite, createClassFromSpec } from '../../react-vega/src';
import { format } from 'd3-format'

const selfFinanceCats = ['Personal contributions','Loans']
const committeeCats = ['PAC contributions','Political party contributions','Incidental committee contributions','Other political committee contributions']
const individualCats = ['Individual contributions']
const otherCats = ['Unitemized contributions','Fundraisers & misc']

const dollarFormat = format('$,.0f')

const CampaignFinanceState = (props) => {
    const {
        candidate, contributions, expenditures
    } = props
    // console.log(candidate)
    console.table(contributions[1])

    const reportingPeriods = Array.from(new Set(contributions.map(d => d['Reporting Period'])))

    const primary = contributions.filter(d => d['Election Type'] === 'PM')
    const general = contributions.filter(d => d['Election Type'] === 'GN')

    const donations = {
        primary: {
            all: primary,
            selfFinance: primary.filter(d => selfFinanceCats.includes(d.type)),
            committee: primary.filter(d => committeeCats.includes(d.type)),
            individual: primary.filter(d => individualCats.includes(d.type)),
            other: primary.filter(d => otherCats.includes(d.type)),
        },
        general: {
            all: general,
            selfFinance: general.filter(d => selfFinanceCats.includes(d.type)),
            committee: general.filter(d => committeeCats.includes(d.type)),
            individual: general.filter(d => individualCats.includes(d.type)),
            other: general.filter(d => otherCats.includes(d.type)),
        }
    }

    console.log(donations)

    // const selfContributions = contributions.filter(d => selfCats.includes(d.type))

    // console.log('self', selfContributions.length, selfContributions)

    const totalRaised = contributions.reduce((acc, obj) => obj['Amount'] + acc, 0)
    const totalRaisedPrimary = primary.reduce((acc, obj) => obj['Amount'] + acc, 0)
    const totalRaisedGeneral = general.reduce((acc, obj) => obj['Amount'] + acc, 0)
    // const totalSpent = expenditures.reduce((acc, obj) => obj['Amount'] + acc, 0)

    return <div>
            <div>**Campaign Finance State**</div>
            <div>Reporting periods: {reportingPeriods.join(',')}</div>
            <div>Total raised: {dollarFormat(totalRaised)} </div>
            <div>Primary: {dollarFormat(totalRaisedPrimary)} </div>
            <div>General: {dollarFormat(totalRaisedGeneral)} </div>
            {/* <div>Total raised: {totalSpent} </div> */}
        </div>
}

export default CampaignFinanceState
