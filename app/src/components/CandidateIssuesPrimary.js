import React from "react"

import TextBlock from '../library/TextBlock.js'
// <TextBlock paragraphs={checkBackSectionText} />

import styles from './CandidateIssues.module.css'

const hed = 'On the issues'
const ledeIn = `Issue statements were solicited from active candidates via a written questionnaire before the June primary election. Answers were lightly edited for punctuation and spelling.`

const excludedRaceNote = `Due to time constraints, MTFP didn't conduct a candidate questionnaire for this race before the June primary.`
const noAnswerNote = `No responses on file to questionnaire conducted before June primary. {ledeIn} All active candidates in the race were contacted repeatedly via phone numbers and emails included in election paperwork. Some didn't submit complete responses by deadline.`

const CandidateIssues = (props) => {
    const { color, race } = props
    const responses = props.candidate.issues && props.candidate.issues.responses

    if ((race.hasIssueStatements === 'no')) {
        return <div className={styles.container}>
            <h2>{hed}</h2>
            <div className={'note'}>{excludedRaceNote}</div>
        </div>
    }

    if (!responses) {
        return <div className={styles.container}>
            <h2>{hed}</h2>
            <div className={'note'}>{noAnswerNote}</div>
        </div>
    }

    const responsesRendered = responses.map((issue, i) => {
        return <div key={String(i)} className={styles.response}>
            <h4 className={styles.issueHeader} style={{backgroundColor: color}}>{issue.question}</h4>
            <TextBlock paragraphs={issue.answer} />
        </div>
    })
    return (
        <div className={styles.container}>
            <h2>{hed}</h2>
            <div className={'note'}>{ledeIn}</div>
            <div className={styles.responses}>{responsesRendered}</div>
        </div>
    )
}


export default CandidateIssues
