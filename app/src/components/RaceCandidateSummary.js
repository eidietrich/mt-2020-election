import React from 'react'
import { navigate } from 'gatsby'

import CandidateMug from './CandidateMug'

import styles from './RaceCandidateSummary.module.css'

import {parties, excludeStatuses} from '../logic/config.js'
import { makeCandidateKey } from '../logic/functions.js'

const RaceCandidateSummary = (props) => {
    const {race, candidates} = props  
    const primaryFields = parties
      .filter(party => candidates.find(d => d.party === party.key)) // exclude parties w/out candidates
      .map(party => {
        const partyCandidates = candidates
          .filter(d => !excludeStatuses.includes(d.status))
          .filter(d => d.party === party.key)
        return <Primary key={party.key}
          name={party.name}
          candidates={partyCandidates}
          party={party}
        />
      })
  
    return <div className={styles.Race}>
  
      {/* <div className={styles.officeHeader}>
        <h2 className={styles.officeName}>{race.position}</h2>
        <div className={styles.officeType}>{race.type} race</div>
        <div className={styles.officeDescription}>{race.description}</div>
      </div> */}
      
      <div className={styles.officePrimaries}>
        {primaryFields}
      </div>

    </div>
  }
  export default RaceCandidateSummary
  
  const Primary = (props) => {
    const {candidates, party} = props
    return <div className={styles.Primary}>
      <h4 className={styles.primaryName} style={{color: party.color}}>{props.name}</h4>
      <div className={styles.primaryCandidates}>
        {candidates.map(candidate => {
          const urlKey = makeCandidateKey(candidate)
          return <CandidateMug
            key={candidate.last_name}
            candidate={candidate}
            party={party}
            handleSelect={() => navigate(`candidates/${urlKey}/`)}
          />
        })}
      </div>
    </div>
  }