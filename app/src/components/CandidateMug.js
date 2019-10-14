import React from 'react'
import Portrait from './Portrait'

import styles from './CandidateMug.module.css'

const CandidateMug = (props) => {
    const {candidate, party, handleSelect, isSelected} = props
    const candidateContent = (<div 
      className={`${styles.CandidateMug} ${isSelected ? styles.selected : null}`}
      style={{borderColor: party.color}} 
      onClick={() => handleSelect(candidate)}
      >
      <div className={styles.mug}>
        <Portrait filename={candidate.photo_slug} />
      </div>
      <div className={styles.name}>{candidate.last_name}</div>
    </div>)
  
    return candidateContent
  
}
export default CandidateMug