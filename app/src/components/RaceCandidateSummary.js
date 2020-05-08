import React from 'react'
import { navigate, Link } from 'gatsby'

import CandidateMug from './CandidateMug'

import styles from './RaceCandidateSummary.module.css'

import {parties, excludeStatuses} from '../logic/config.js'
import { makeCandidateKey, filterToActive, makeRaceKey } from '../logic/functions.js'

const RaceCandidateSummaryWrapper = (props) => {
  const { race } = props
  if (race.type === 'state-district') {
    return <RaceCandidateSummaryWithDistricts {...props} />
  } else {
   
    return <RaceCandidateSummary {...props} />
  }
}
export default RaceCandidateSummaryWrapper


const RaceCandidateSummary = (props) => {
    const { candidates } = props  
    const primaryFields = parties
      .filter(party => candidates.find(d => d.party === party.key)) // exclude parties w/out candidates
      .map(party => {
        const partyCandidates = candidates
          .filter(d => !excludeStatuses.includes(d.status))
          .filter(d => d.party === party.key)
          .sort((a,b) => a.withdrawal_date ? 1 : -1)
        return <Primary key={party.key}
          name={party.name}
          candidates={partyCandidates}
          party={party}
        />
      })
  
    return <div className={styles.Race}>     
      <div className={styles.officePrimaries}>
        {primaryFields}
      </div>

    </div>
  }

  const RaceCandidateSummaryWithDistricts = (props) => {
    const { candidates, race } = props  
    const districtsRendered = race.districts.map(district => {
      const candidatesInDistrict = candidates.filter(d => d.district === district.district)
      return <District 
        name={district.district}
        description={district.description}
        race={race}
        candidates={candidatesInDistrict}
      />
    })
  
    return <div className={styles.Race}>
      <div className={styles.officeDistricts}>
        {districtsRendered}
      </div>

    </div>
  }
  
  
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


  const District = (props) => {
    const {candidates, name, description } = props
    
    const primariesRendered = parties
      .filter(party => candidates.find(d => d.party === party.key)) // exclude parties w/out candidates
      .map(party => {
        const partyCandidates = filterToActive(candidates)
          .filter(d => d.party === party.key)
          .sort((a,b) => a.withdrawal_date ? 1 : -1)
        return <Primary key={party.key}
          name={party.name}
          candidates={partyCandidates}
          party={party}
        />
      })
  
     return <div className={styles.district}>
        <div className={styles.districtInfo}>
          <div className={styles.districtName}>{name}</div>
          <div className={styles.description}>{description}</div>
        </div>
        <div className={styles.officePrimaries}>
          {primariesRendered}
        </div>
      </div>
  }
  
  const RaceWithDistricts = (props) => {
    const {candidates, race } = props
    const districtsRendered = race.districts.map(district => {
      const candidatesInDistrict = candidates.filter(d => d.district === district.district)
      return <District 
        name={district.district}
        description={district.description}
        race={race}
        candidates={candidatesInDistrict}
      />
    })
  
    return <div className={styles.Race}>
        <div className={styles.officeHeader}>
          <Link to={`/races/${makeRaceKey(race)}`}>
            <h2 className={styles.officeName}>{race.position}</h2>
          </Link>
        </div>
      <div className={styles.officeDistricts}>
        {districtsRendered}
      </div>
    </div>
  }