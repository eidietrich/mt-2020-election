import React from "react"
import { Link } from 'gatsby'

import TextBlock from '../library/TextBlock.js'
import Layout from "../components/layout"
import SEO from "../components/seo"

import styles from './races.module.css'

import { races, candidates, racePageText, racePageTitle } from '../data/app-copy.json'

import { makeRaceUrl, makeCandidateUrl, candidateNameParty } from '../logic/functions.js'

const Races = () => {
    console.log(races)
    return <Layout>
        <SEO title="Montana 2020 election races" />
        <h1>{racePageTitle}</h1>
        <TextBlock paragraphs={racePageText} />
        {races.map((race, i) => {
            return <Race key={String(i)}
                race={race}
                candidates={candidates.filter(candidate => candidate.position === race.position)}
            />
        })}
    </Layout>
}

export default Races

const Race = (props) => {
    const { race, candidates } = props
    
    return <div className={styles.Race}>
        <h2><Link to={makeRaceUrl(race)}>{race.position}</Link></h2>
        <p>{race.description}</p>
        {/* <p><Link to={makeRaceUrl(race)}>Race overview</Link></p> */}
        <div>
            <span><strong>Candidates:</strong> </span>
            {candidates.map((c, i) => {
                return <span key={String(i)}><Link to={makeCandidateUrl(c)}>{candidateNameParty(c)}</Link></span>
                })
                .reduce((prev, curr) => [prev, ', ', curr])
            }
        </div>
    </div>
}
