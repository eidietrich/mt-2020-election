import React, {Component} from "react"
import { Link } from "gatsby"

import { timeFormat } from 'd3-time-format'

import Layout from "../components/layout"
import CandidateMug from "../components/CandidateMug"
import SEO from "../components/seo"

import TextBlock from '../library/TextBlock.js'

import {
  // text
  intro,
  introTitle,
  byline,
  // data
  candidates,
  races,
  lastUpdated
} from '../data/app-copy.json'

import styles from './index.module.css'

import { parties } from '../logic/config.js'
import { makeCandidateKey, makeRaceKey, filterToActive } from '../logic/functions.js'

const offices = Array.from(new Set(candidates.map(d => d.position)))

class IndexPage extends Component {
  render(){
    const racesRendered = offices.map(office => {
      const race = races.find(d => d.position === office)
      if (race.type === 'state-district') {
        return <RaceWithDistricts
          key={office}
          name={office}
          candidates={candidates.filter(d => d.position === office )}
          race={race}
        />
      } else {
        return <Race
          key={office}
          name={office}
          candidates={candidates.filter(d => d.position === office )}
          race={race}
        />
      }
    })
    return <Layout>
      <SEO title="Montana's 2020 election" />
      <div className="intro">
        <div className="text">
          <div className={styles.byline}>{byline}</div>
          <div className={styles.timestamp}>Last updated {timeFormat("%B %d, %Y")(new Date(lastUpdated))}</div>
          <TextBlock paragraphs={intro} />
        </div>
      </div>
      <h1>{introTitle}</h1>
      {racesRendered}
    </Layout>
  }
}
export default IndexPage

const Race = (props) => {
  const {candidates, race } = props
  const primaryFields = parties
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

  return <div className={styles.Race}>
    <div className={styles.officeHeader}>
      <Link to={`/races/${makeRaceKey(race)}`}>
        <h2 className={styles.officeName}>{race.position}</h2>
      </Link>
      {/* <div className={styles.officeType}>{race.type} race</div> */}
    </div>
    {/* <div className={styles.officeDescription}>{race.description}</div> */}
    <div className={styles.officePrimaries}>
      {primaryFields}
    </div>
  </div>
}

const Primary = (props) => {
  const {candidates, party } = props
  return <div className={styles.Primary}>
    <h4 className={styles.primaryName} style={{color: party.color}}>{props.name}</h4>
    <div className={styles.primaryCandidates}>
      {candidates.map(candidate => <CandidateMug
        key={makeCandidateKey(candidate)}
        candidate={candidate}
      />)}      
    </div>
  </div>
}

const District = (props) => {
  const {candidates, name } = props
  
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
