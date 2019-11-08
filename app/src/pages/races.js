import React from "react"
import { Link } from 'gatsby'

import TextBlock from '../library/TextBlock.js'
import Layout from "../components/layout"
import SEO from "../components/seo"

import UsFlagIcon from '../library/UsFlagIcon'
import MtFlagIcon from '../library/MtFlagIcon'

import styles from './races.module.css'

import { races, candidates, racePageText, racePageTitle } from '../data/app-copy.json'

import { makeRaceUrl, makeCandidateUrl, candidateNameParty, filterToActive } from '../logic/functions.js'

const activeCandidates = filterToActive(candidates)

const Races = () => {
    return <Layout>
        <SEO title="Montana 2020 election - races" />
        <h1>{racePageTitle}</h1>
        <TextBlock paragraphs={racePageText} />
        <div className={styles.races}>
            {races.map((race, i) => {
                return <Race key={String(i)}
                    race={race}
                    candidates={activeCandidates.filter(candidate => candidate.position === race.position)}
                />
            })}
        </div>
        
    </Layout>
}

export default Races

const Race = (props) => {
    const { race, candidates } = props
    // console.log(race.type)

    const flagIcon = (race.type === 'federal') ? <UsFlagIcon /> : <MtFlagIcon />
    
    return <div className={styles.race}>
        <Link to={makeRaceUrl(race)}>
            <div className={styles.raceHeader}>            
                <div className={styles.flag}>{flagIcon}</div>
                {race.position}
            </div>
        </Link>
        
        
        <p className={styles.description}>{race.description}</p>
        {/* <p><Link to={makeRaceUrl(race)}>Race overview</Link></p> */}
        <div className={styles.candidates}>
            <span><strong>Candidates:</strong> </span>
            {candidates.map((c, i) => {
                return <span key={String(i)}><Link to={makeCandidateUrl(c)}>{candidateNameParty(c)}</Link></span>
                })
                .reduce((prev, curr) => [prev, ', ', curr])
            }
        </div>
    </div>
}
