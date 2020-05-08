import React from "react"

import TextBlock from '../library/TextBlock.js'
// <TextBlock paragraphs={checkBackSectionText} />

import { 
    getCandidateParty
} from '../logic/functions.js'

import { parties } from '../logic/config.js'

import styles from './RaceIssues.module.css'

const RaceIssues = (props) => {
    const { candidates, race } = props

    if (race.hasIssueStatements === 'no') {
        return <div className={styles.container}>
            <h2>On the issues</h2>
            <div className={'note'}>Due to time constraints, MTFP hasn't conducted a candidate questionnaire for this race.</div>
        </div>
    }

    // Assume all candidates have same questions
    const questions = candidates[0].issues.responses.map(d => d.question)
    const byQuestion = questions.map((question,i) => {
        return {
            question: question,
            candidates: candidates
            .map(candidate => {
                const responses = candidate.issues && candidate.issues.responses
                const response = (responses && (i < responses.length)) ? responses[i] : null
                const answer = response && response.answer
                return {
                    candidate: candidate,
                    answer: answer
                }
            })
        }
    })

    const missingResponses = candidates.filter(d => !d.withdrawal_date).filter(d => !d.issues)

    let renderedMissing = null
    if (missingResponses.length > 0) {
        const listed = missingResponses.map(d => `${d.first_name} ${d.last_name}`)
        const text = listed.length > 1 ? `${listed.slice(0, -1).join(', ')} or ${listed.slice(-1)}` : listed[0]
        const noResponsesText = (listed.length > 0) ? ` Complete responses weren't submitted by our deadline from ${text}.` : null
        renderedMissing =  <div className={'note'}>
            Issue statements were solicited from active candidates via a written questionnaire. Answers have been lightly edited for punctuation and spelling.{noResponsesText} 
        </div>
    }
    
    const questionsRendered = byQuestion.map((issue, i) => {
        
        const primariesRendered = parties.map(d => {
            const partyCandidates = issue.candidates.filter(c => c.candidate.party === d.key)
            if (partyCandidates.length === 0) return null
            const candidatesRendered = partyCandidates.map(candidate => {
                if (!candidate.answer) return null
                const party = getCandidateParty(candidate.candidate)
                const color = party.color
                return <div key={candidate.candidate.last_name}
                    className={styles.candidate}
                    style={{
                        border: `1px solid ${color}`,
                        // borderTop: `1px solid ${color}`
                    }}
                >
                    <h4 className={styles.candidateHeader} style={{backgroundColor: color}}>
                        {candidate.candidate.first_name} {candidate.candidate.last_name} ({candidate.candidate.party})
                    </h4>
                    <div className={styles.candidateResponse}>
                        <TextBlock paragraphs={candidate.answer} />
                    </div>
                   
                </div>
            })
            return <div key={d.key} className={styles.primaryGrouping}>
                {candidatesRendered}
            </div>
        })

        return <div className={styles.question} key={String(i)}>
            <h3 className={styles.questionHeader}>{issue.question}</h3>
           
            <div className={styles.candidates}>
                {primariesRendered}
            </div>
           
            
        </div>
    })
    return (
        <div className={styles.section}>
            <h2>On the issues</h2>
            {renderedMissing}
            <div className={styles.responses}>{questionsRendered}</div>
        </div>
    )
}


export default RaceIssues
