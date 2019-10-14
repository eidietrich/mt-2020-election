import React from 'react'
import { Link } from "gatsby"

import styles from './CandidateSummary.module.css'

import {makeCandidateKey, cleanDisplayUrl, getCandidateParty } from '../logic/functions.js'

const CandidateSummary = (props) => {
    const {candidate} = props
    const party = getCandidateParty(candidate)
    return <div>
      <div className={styles.summaryHeader} style={{backgroundColor: party.color}}>
        <div className={styles.summaryHeaderTitle}>
          {party.name} for {candidate.position}
        </div>
        
      </div>
      <div className={styles.summaryBody}>
        <div className={styles.summaryTopMatter}>
          <div className={styles.summaryTopMatterText}>
            <div className={styles.summaryTitle}>{candidate.current_title}</div>
            <div className={styles.summaryName}>{candidate.first_name} {candidate.last_name}</div>
          </div>
        </div>
        
        <div className={styles.summaryNarrative} dangerouslySetInnerHTML={{ __html: candidate.text }} />
  
        <div className={styles.summaryPodcast}>
            {candidate.podcast_url ? <div><strong>INTERVIEW: </strong><a href={candidate.podcast_url}>Montana Lowdown Podcast</a></div> : null}
        </div>
         
        <div className={styles.summaryContacts}>
            {candidate.web_url ? <div><strong>Website: </strong><a href={candidate.web_url}>{cleanDisplayUrl(candidate.web_url)}</a></div> : null}
            {candidate.fb_url ? <div><strong>Facebook: </strong><a href={candidate.fb_url}>{cleanDisplayUrl(candidate.fb_url)}</a></div> : null}
            {candidate.tw_url ? <div><strong>Twitter: </strong><a href={candidate.tw_url}>{cleanDisplayUrl(candidate.tw_url)}</a></div> : null}
        </div>
        <Link to={`/candidates/${makeCandidateKey(candidate)}`} className='button-link'>
          <button className={styles.summaryButton}>
              More on {candidate.last_name}
          </button>
        </Link>
      </div>
      
      
    </div>
}

export default CandidateSummary