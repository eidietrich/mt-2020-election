import React from "react"

import { getPartyColor } from '../logic/functions.js'
import { percentFormat, numberFormat } from '../logic/config.js'

import styles from './RacePrimaryResults.module.css'

const RacePrimaryResults = (props) => {
    const { race } = props

    if (!race.primaryResultsByDistrict) {
        return <div className={styles.container}>
            <h2>Primary Results</h2>
            <div className={'note'}>No primary results in this race.</div>
        </div>
    }

    const primaries = race.primaryResultsByDistrict.map(primary => {
        return <div className={styles.primary} key={primary.primaryLabel}>
            <div className={styles.primaryTitle}>{primary.primaryLabel}</div>
            {summaryTable({data: primary.results})}
        </div>
    })

    return (
        <div className={styles.section}>
            <h2>Primary results</h2>
            <div className="note">Vote totals from Montana's June 2, 2020 primary election.</div>
            <div>{primaries}</div>
        </div>
    )
}


export default RacePrimaryResults

const summaryTable = ({data}) => {
    // data should be pre-sorted totals from makeTotals()

    const rows = data.map((d,i) => {
        const isWinner = (d.votes === Math.max(...data.map(o => o.votes)))
        return <tr key={String(i)} className={isWinner ? styles.winner : null}>
            <td className={styles.label}>
                <span className={styles.icon} style={{
                    backgroundColor: getPartyColor(d.party[0])
                }}></span>
                {d.name}
            </td>
            <td className={styles.num}>{numberFormat(d.votes)}</td>
            <td className={styles.num}>{(d.votes > 0) ? percentFormat(d.percent) : '--'}</td>
            <td className={styles.num}>{numberFormat(d.votesBehindLeader)}</td>
        </tr>
    })
    
    return <table className={styles.resultTable}>
        <thead>
            <tr>
                <th className={styles.label}>Candidate</th>
                <th className={styles.num}>Votes counted</th>
                <th className={styles.num}>% of vote</th>
                <th className={styles.num}>Votes behind</th>
            </tr>
        </thead>
        <tbody>
            {rows}
        </tbody>
    </table>
}