import React from 'react'
import { Link } from "gatsby"

import CandidateMug from './CandidateMug'
import PodcastLink from '../library/PodcastLink'

import styles from './CandidateSummary.module.css'

import {
  makeCandidateUrl,
  cleanDisplayUrl,
} from '../logic/functions.js'

const CandidateSummary = (props) => {
    const {candidate} = props
    return <div className={styles.CandidateSummary}>
      <div className={styles.body}> 
        <div className={styles.container}>
          <div className={styles.portraitNameTitleGroup}>
              <CandidateMug candidate={candidate}/>
            <div className={styles.nameTitleGroup}>
              <div className={styles.district}>{candidate.district ? candidate.district : null}</div>
              <div className={styles.name}>
                <Link to={makeCandidateUrl(candidate)}>{candidate.first_name} {candidate.last_name}</Link>
              </div>
              <div className={styles.withdrawn}>
                {candidate.withdrawal_date ? `Withdrew ${candidate.withdrawal_date}` : null}
              </div>
              <div className={styles.contacts}>
                {candidate.web_url ? <div><strong>Website: </strong><a href={candidate.web_url}>{cleanDisplayUrl(candidate.web_url)}</a></div> : null}
                {candidate.fb_url ? <div><strong>Facebook: </strong><a href={candidate.fb_url}>{cleanDisplayUrl(candidate.fb_url)}</a></div> : null}
                {candidate.tw_url ? <div><strong>Twitter: </strong><a href={candidate.tw_url}>{cleanDisplayUrl(candidate.tw_url)}</a></div> : null}
              </div>
            </div>
          </div>
          <div className={styles.textGroup}>
            <div className={styles.bio} dangerouslySetInnerHTML={{ __html: candidate.text }} />

            {/* {candidate.podcast_url ? <PodcastLink podcastUrl={candidate.podcast_url} /> : null} */}
  
          </div>
        </div>
      </div>   
    </div>
}
export default CandidateSummary

