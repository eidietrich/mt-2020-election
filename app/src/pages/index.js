import React, {Component} from "react"
import { Link, navigate } from "gatsby"

import { timeFormat } from 'd3-time-format'

import Layout from "../components/layout"
import CandidateMug from "../components/CandidateMug"
import CandidateSummary from '../components/CandidateSummary'
import SEO from "../components/seo"

import TextBlock from '../library/TextBlock.js'

import text from '../data/app-copy.json'

import styles from './index.module.css'

import { parties, excludeStatuses } from '../logic/config.js'
import { makeCandidateKey, makeRaceKey } from '../logic/functions.js'


const { candidates, races, lastUpdated } = text

const offices = Array.from(new Set(candidates.map(d => d.position)))

class IndexPage extends Component {
  constructor(props){
    super(props)

    this.state = {
      selCandidate: null
    }

    this.select = this.select.bind(this)
    this.reset = this.reset.bind(this)
  }
  
  // // Make page interactive
  // select(candidate){
  //   this.setState({
  //     selCandidate: makeCandidateKey(candidate)
  //   })
  // }

  select(candidate){
    navigate(`candidates/${makeCandidateKey(candidate)}/`)
  }

  reset(){
    this.setState({selCandidate: null})
  }

  render(){
    return <Layout>
      <SEO title="Home" />
      <div className="intro">
        {/* <h1>{text.headline}</h1> */}
        <div className="intro-text">
          <div className={styles.byline}>{text.byline}</div>
          <div className={styles.timestamp}>Last updated {timeFormat("%B %d, %Y")(new Date(lastUpdated))}</div>
          <TextBlock paragraphs={text.intro} />
        </div>
      </div>
      <h1>Overview: Who's in the running</h1>
      <div>(A text-only version of this page is <Link to='/text-only'>here</Link>.)</div>
      {offices.map(office => <Race
          key={office}
          name={office}
          candidates={candidates.filter(d => d.position === office )}
          race={races.find(d => d.position === office)}

          // interaction
          selCandidate={this.state.selCandidate}
          select={this.select}
          reset={this.reset}
      />)}
    </Layout>
  }
}
export default IndexPage

const Race = (props) => {
  const {candidates, race, selCandidate, select, reset} = props
  // null if no selCandidate or selCandidate isn't in Office list
  const summarizeCandidate = candidates
    .find(d => makeCandidateKey(d) === selCandidate)
  // const descriptionObject = positionDescriptions.find(d => d.position === name)

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
        // interaction
        selCandidate={selCandidate}
        select={select}
        reset={reset}
        
      />
    })

  return <div className={styles.Race}>

    <Link to={`races/${makeRaceKey(race)}`}>
      <div className={styles.officeHeader}>
        <h2 className={styles.officeName}>{race.position}</h2>
        {/* <div className={styles.officeType}>{race.type} race</div> */}
        {/* <div className={styles.officeDescription}>{race.description}</div> */}
      </div>
    </Link>
    
    <div className={styles.officePrimaries}>
      {primaryFields}
    </div>
    <div className={styles.summaryModal}
      onClick={reset}
      style={{
        display: (summarizeCandidate === undefined) ? 'none' : 'block',
      }}
    >
      {(summarizeCandidate === undefined) ? null : <CandidateSummary candidate={summarizeCandidate}/> }
    </div>
  </div>
}

const Primary = (props) => {
  const {candidates, party, select, reset, selCandidate} = props
  return <div className={styles.Primary}>
    <h4 className={styles.primaryName} style={{color: party.color}}>{props.name}</h4>
    <div className={styles.primaryCandidates}>
      {candidates.map(candidate => <CandidateMug
        key={candidate.last_name}
        candidate={candidate}
        party={party}
        // interaction
        handleSelect={select}
        handleReset={reset}
        isSelected={makeCandidateKey(candidate) === selCandidate}
      />)}
    </div>
  </div>
}
