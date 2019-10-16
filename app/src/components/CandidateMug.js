import React from 'react'
import Portrait from './Portrait'

import styles from './CandidateMug.module.css'

const CandidateMug = (props) => {
    const {candidate, party, handleSelect, handleReset, isSelected, suppressLabel} = props

    const candidateContent = (<div 
      className={`${styles.CandidateMug} ${isSelected ? styles.selected : null}`}
      style={{borderColor: party.color}} 
      onClick={() => !isSelected ? handleSelect(candidate) : handleReset()}
      >
      <div className={styles.mug}>
        <Portrait filename={candidate.photo_slug}/>
      </div>
      {(!suppressLabel) ? <div className={styles.name}>{candidate.last_name}</div> : null}
    </div>)
  
    return candidateContent
  
}
export default CandidateMug