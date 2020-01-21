import React from 'react'
import { Link } from "gatsby"

import Portrait from './Portrait'

import {
  getCandidateParty,
  makeCandidateUrl
} from '../logic/functions'

import styles from './CandidateMug.module.css'

const CandidateMug = (props) => {
    const {candidate} = props
    const withdrawnStyle = candidate.withdrawal_date ? styles.withdrawn : null
    const party = getCandidateParty(candidate)
    const mug = (<div 
      className={`${styles.CandidateMug} ${styles.button}`}
      style={{borderColor: party.color}} 
      >
      <div className={`${styles.mug} ${withdrawnStyle}`}>
        <Portrait filename={candidate.photo_slug}/>
      </div>
      <div className={styles.name}>{candidate.last_name}</div>
    </div>)

    return <Link to={makeCandidateUrl(candidate)} className={styles.mugLink}>
      {mug}
    </Link>
  
}
export default CandidateMug