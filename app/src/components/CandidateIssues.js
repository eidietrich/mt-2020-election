import React from "react"

import TextBlock from '../library/TextBlock.js'
// <TextBlock paragraphs={checkBackSectionText} />

import styles from './CandidateIssues.module.css'

const CandidateIssues = (props) => {
    const { color } = props
    const responses = props.candidate.issues && props.candidate.issues.responses

    console.log(responses)

    if (!responses) {
        return <div className={styles.section}>
            <h2>On the issues</h2>
            <div>No responses on file</div>
        </div>
    }

    const responsesRendered = responses.map((issue, i) => {
        return <div key={String(i)} className={styles.response}>
            <h4 className={styles.issueHeader} style={{backgroundColor: color}}>{issue.question}</h4>
            <TextBlock paragraphs={issue.answer} />
        </div>
    })
    return (
        <div className={styles.section}>
            <h2>On the issues</h2>
            <div className={styles.responses}>{responsesRendered}</div>
        </div>
    )
}


export default CandidateIssues
