import React from "react"

import Layout from "../components/layout"
import SEO from "../components/seo"

import CandidateSummary from '../components/CandidateSummary'

import TextBlock from '../library/TextBlock.js'

import {
  makeCandidateKey,
  filterToActive,
  getPartyFromLetter,
} from '../logic/functions.js'

import {
  candidates,
  candidatePageTitle,
  candidatePageText
} from '../data/app-copy.json'

import styles from './candidates.module.css'

const Candidates = () => {
  const activeCandidates = filterToActive(candidates)
  const races = Array.from(new Set(activeCandidates.map(d => d.position)))

  return <Layout>
    <SEO title="Montana's 2020 election | Candidates" />
    <h1>{candidatePageTitle}</h1>
    <TextBlock paragraphs={candidatePageText} />
    <div>
      {races.map(race => <Race
          key={race}
          raceName={race}
          candidates={activeCandidates.filter(d => d.position === race )}          
      />)}
    </div>
  </Layout>
}
export default Candidates

const Race = (props) => {
  const {candidates, raceName} = props

  const parties = Array.from(new Set(candidates.map(d => d.party)))
  const primaryFields = parties
    .filter(partyLetter => candidates.find(d => d.party === partyLetter)) // exclude parties w/out candidates
    .map(partyLetter => {
      const party = getPartyFromLetter(partyLetter)        
      return <Primary key={party.key}
        candidates={candidates.filter(d => d.party === partyLetter)}
        party={party}        
        raceName={raceName}
      />
    })

  return <div className={styles.Race}>
    <div className={styles.raceName}>- {raceName} -</div>
    {primaryFields}
    <hr className={styles.divider}/>
  </div>
}

const Primary = (props) => {
  const {candidates, party, raceName } = props
  const candidateSummaries = candidates.map(candidate => <CandidateSummary
      key={makeCandidateKey(candidate)}
      candidate={candidate}
  />)
  // const plural = (candidates.length > 1) ? 's' : ''
  return <div className={styles.Primary}>
    <div className={styles.primaryHeader} style={{backgroundColor: party.color}}>
  <h2 className={styles.officeName}>{raceName} - {party.name}</h2>
    </div>

    {/* <h4 className={styles.primaryName} style={{color: party.color}}>{props.name}</h4> */}
    <div className={styles.primaryCandidates}>
      {candidateSummaries}
    </div>
  </div>
}