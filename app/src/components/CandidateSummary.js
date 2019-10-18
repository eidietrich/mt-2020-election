import React from 'react'
import { Link, navigate } from "gatsby"

import Portrait from './Portrait'
import PodcastLink from '../library/PodcastLink'

import styles from './CandidateSummary.module.css'

import {
  makeCandidateUrl,
  cleanDisplayUrl,
  getCandidateParty
} from '../logic/functions.js'

const CandidateSummary = (props) => {
    const {candidate} = props
    const party = getCandidateParty(candidate)
    return <div>
      <div className={styles.header} style={{backgroundColor: party.color}}>
        {party.name} for {candidate.position}
        <div className={styles.summaryHeaderTitle}>
          
        </div> 
      </div>
      <div className={styles.body}> 
        <div className={styles.container}>
          <div className={styles.portraitNameTitleGroup}>
            <div className={styles.portrait}>
            <Link to={makeCandidateUrl(candidate)}>
              <Portrait filename={candidate.photo_slug} />
            </Link>
            </div>
            <div className={styles.nameTitleGroup}>
              <div className={styles.title}>{candidate.current_title}</div>
              <div className={styles.name}>
                <Link to={makeCandidateUrl(candidate)}>{candidate.first_name} {candidate.last_name}</Link>
              </div>
            </div>
          </div>
          <div className={styles.textGroup}>
            <div className={styles.bio} dangerouslySetInnerHTML={{ __html: candidate.text }} />

            {candidate.podcast_url ? <PodcastLink podcastUrl={candidate.podcast_url} /> : null}

            <div className={styles.contacts}>
              {candidate.web_url ? <div><strong>Website: </strong><a href={candidate.web_url}>{cleanDisplayUrl(candidate.web_url)}</a></div> : null}
              {candidate.fb_url ? <div><strong>Facebook: </strong><a href={candidate.fb_url}>{cleanDisplayUrl(candidate.fb_url)}</a></div> : null}
              {candidate.tw_url ? <div><strong>Twitter: </strong><a href={candidate.tw_url}>{cleanDisplayUrl(candidate.tw_url)}</a></div> : null}
          </div>
          </div>
          
        </div>
        
        {/* <Link to={`/candidates/${makeCandidateKey(candidate)}`} className='button-link'>
          <button className={styles.summaryButton}>
              More on {candidate.last_name}
          </button>
        </Link> */}
      </div>
      
      
    </div>
}

export default CandidateSummary

