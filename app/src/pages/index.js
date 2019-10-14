import React, {Component} from "react"
import { Link } from "gatsby"

import { timeFormat } from 'd3-time-format'

import Layout from "../components/layout"
import CandidateImage from "../components/CandidateImage"
import SEO from "../components/seo"

// import Popup from "reactjs-popup";

import text from '../data/app-copy.json'

import styles from './index.module.css'

import { parties, excludeStatuses } from '../logic/config.js'
import { makeCandidateKey, cleanDisplayUrl, getCandidateParty } from '../logic/functions.js'


const { candidates, positionDescriptions, lastUpdated } = text

const offices = Array.from(new Set(candidates.map(d => d.position)))

class IndexPage extends Component {
  constructor(props){
    super(props)

    this.state = {
      // selCandidate: null
      selCandidate: candidates[0]
    }

    this.select = this.select.bind(this)
    this.reset = this.reset.bind(this)
  }

  select(candidate){
    this.setState({
      selCandidate: makeCandidateKey(candidate)
    })
  }

  reset(){
    this.setState({selCandidate: null})
  }

  render(){
    console.log(lastUpdated)
    return <Layout>
      <SEO title="Home" />
      <div className="intro">
        <div>[TK: MTFP Header]</div>
        <h1>{text.headline}</h1>
        <div className="intro-text">
          {/* <div className={styles.byline}>By MTFP Staff</div> */}
          <div className={styles.timestamp}>Last updated {timeFormat("%B %d, %Y")(new Date(lastUpdated))}</div>
          {text.intro.map((d,i) => <p key={String(i)} dangerouslySetInnerHTML={{ __html: d.value }}></p>)}
        </div>
      </div>
      {offices.map(office => <Office
          key={office}
          name={office}
          candidates={candidates.filter(d => d.position === office )}
          positionDescriptions={positionDescriptions}

          selCandidate={this.state.selCandidate}
          select={this.select}
          reset={this.reset}
      />)}
      <div>See a text-only version of this page <Link to='/text-only'>here</Link>.</div>
    </Layout>
  }
}

export default IndexPage

const Office = (props) => {
  const {name, candidates, positionDescriptions, selCandidate, select, reset} = props
  // null if no selCandidate or selCandidate isn't in Office list
  const summarizeCandidate = candidates
    .find(d => makeCandidateKey(d) === selCandidate)
  const descriptionObject = positionDescriptions.find(d => d.position === name)
  return <div className={styles.Office}>
    <div className={styles.officeHeader}>
      <h2 className={styles.officeName}>{name}</h2>
      {descriptionObject ? <div className={styles.officeDescription}>{descriptionObject.description}</div>: null}
    </div>
    
    <div className={styles.officePrimaries}>
      {parties
        .filter(party => candidates.find(d => d.party === party.key)) // exclude parties w/out candidates
        .map(party => {
          const partyCandidates = candidates
            .filter(d => !excludeStatuses.includes(d.status))
            .filter(d => d.party === party.key)
          return <Primary key={party.key}
            name={party.name}
            candidates={partyCandidates}
            party={party}
            select={select}
            selCandidate={selCandidate}
          />
        })
      }
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
  const {candidates, party, select, selCandidate} = props
  return <div className={styles.Primary}>
    <h4 className={styles.primaryName} style={{color: party.color}}>{props.name}</h4>
    <div className={styles.primaryCandidates}>
      {candidates.map(candidate => <CandidateMug
        key={candidate.last_name}
        candidate={candidate}
        party={party}
        handleSelect={select}
        isSelected={makeCandidateKey(candidate) === selCandidate}
      />)}
    </div>
  </div>
}

const CandidateMug = (props) => {
  const {candidate, party, handleSelect, isSelected} = props
  const candidateContent = (<div 
    className={`${styles.Candidate} ${isSelected ? styles.selected : null}`}
    style={{borderColor: party.color}} 
    onClick={() => handleSelect(candidate)}
    >
    <div className={styles.mug}>
     <CandidateImage filename={candidate.photo_slug} />
     {/* <Image /> */}
    </div>
    <div className={styles.name}>{candidate.last_name}</div>
  </div>)

  return candidateContent

}

const CandidateSummary = (props) => {
  const {candidate} = props
  const isIncumbent = (candidate.incumbent === 'TRUE')
  const party = getCandidateParty(candidate)
  return <div>
    <div className={styles.summaryHeader} style={{backgroundColor: party.color}}>
      <div className={styles.summaryHeaderTitle}>
        {party.name} for {candidate.position}
      </div>
      
    </div>
    <div className={styles.summaryBody}>
      <div className={styles.summaryTopMatter}>
        <div className={styles.summaryImage}>
          <CandidateImage filename={candidate.photo_slug} />
        </div>
        <div className={styles.summaryTopMatterText}>
          <div className={styles.summaryTitle}>{candidate.current_title}</div>
          <div className={styles.summaryName}>{candidate.first_name} {candidate.last_name}</div>
        </div>

      </div>
      
      <div className={styles.summaryNarrative} dangerouslySetInnerHTML={{ __html: candidate.text }} />

      <div className={styles.summaryPodcast}>
          {candidate.podcast_url ? <div><strong>INTERVIEW: </strong><a href={candidate.podcast_url}>Montana Lowdown Podcast</a></div> : null}
      </div>
       
      <div className={styles.summaryContacts}>
          {candidate.web_url ? <div><strong>Website: </strong><a href={candidate.web_url}>{cleanDisplayUrl(candidate.web_url)}</a></div> : null}
          {candidate.fb_url ? <div><strong>Facebook: </strong><a href={candidate.fb_url}>{cleanDisplayUrl(candidate.fb_url)}</a></div> : null}
          {candidate.tw_url ? <div><strong>Twitter: </strong><a href={candidate.tw_url}>{cleanDisplayUrl(candidate.tw_url)}</a></div> : null}
      </div>
      <Link to={`/candidates/${makeCandidateKey(candidate)}`} className='button-link'>
        <button className={styles.summaryButton}>
            More on {candidate.last_name}
        </button>
      </Link>
    </div>
    
    
  </div>
}