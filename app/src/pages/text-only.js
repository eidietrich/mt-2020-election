import React, {Component} from "react"
import { Link } from "gatsby"

import { timeFormat } from 'd3-time-format'

import Layout from "../components/layout"
import SEO from "../components/seo"

import text from '../data/app-copy.json'

import styles from './index.module.css'

import { parties, excludeStatuses } from '../logic/config.js'
import { cleanDisplayUrl } from '../logic/functions.js'


const { candidates, positionDescriptions, lastUpdated } = text

const offices = Array.from(new Set(candidates.map(d => d.position)))

class PlainTextPage extends Component {

  render(){
    const officeSections = offices.map(office => <Office
      key={office}
      name={office}
      candidates={candidates.filter(d => d.position === office )}
      officeInfo={positionDescriptions.find(d => d.position === office)}
    />)  

    return <Layout>
      <SEO title="Plain Text" />
      <h1>{text.headline}</h1>
      <div className="body">
        <div>
            <div className={styles.byline}>By MTFP Staff</div>
            <div className={styles.timestamp}>Last updated {timeFormat("%B %d, %Y")(new Date(lastUpdated))}</div>
            {text.intro.map((d,i) => <p key={String(i)} dangerouslySetInnerHTML={{ __html: d.value }}></p>)}
        </div>
        {officeSections}
      </div>
    </Layout>
  }
}
export default PlainTextPage

const Office = (props) => {
  const {name, candidates, officeInfo} = props

  const partySections = parties
    .filter(party => candidates.find(d => d.party === party.key))
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
  return <section>
    <h2 className={styles.officeName}>{name}</h2>
    {officeInfo.description ? <div>{officeInfo.description}</div>: null}
    {partySections}
  </section>
}

const Primary = (props) => {
  const {candidates, party, name} = props
  const candidateSections = candidates.map((candidate, i) => {
    return <Candidate candidate={candidate} key={String(i)} />
  })
  return <div>
    <h3 style={{color: party.color}}>{name}</h3>
    {candidateSections}
  </div>
}

const Candidate = (props) => {
  const { candidate } = props
  return <div>
    <h4>{candidate.current_title} {candidate.first_name} {candidate.last_name} ({candidate.party.slice(0,1)})</h4>
    <div dangerouslySetInnerHTML={{ __html: candidate.text }} />
    <ul>
      {candidate.web_url ? <li><strong>Website:</strong> <a href={candidate.web_url}>{cleanDisplayUrl(candidate.web_url)}</a></li> : null}
      {candidate.fb_url ? <li><strong>Facebook:</strong> <a href={candidate.fb_url}>{cleanDisplayUrl(candidate.fb_url)}</a></li> : null}
      {candidate.tw_url ? <li><strong>Twitter:</strong> <a href={candidate.tw_url}>{cleanDisplayUrl(candidate.tw_url)}</a></li> : null}
      {candidate.insta_url ? <li><strong>Instagram:</strong> <a href={candidate.insta_url}>{cleanDisplayUrl(candidate.insta_url)}</a></li> : null}
    </ul>
  </div>
}