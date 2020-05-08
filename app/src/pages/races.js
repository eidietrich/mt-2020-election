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
                const candidates = activeCandidates.filter(candidate => candidate.position === race.position)
                return <Race key={String(i)}
                    race={race}
                    candidates={candidates}
                />
            })}
        </div>
        
    </Layout>
}

export default Races

const Race = (props) => {
    const { race, candidates } = props

    const flagIcon = (race.type === 'federal') ? <UsFlagIcon /> : <MtFlagIcon />
    let candidatesRendered = '(None)'
    if (candidates.length > 0) {
        candidatesRendered = candidates.map((c, i) => {
            return <span key={String(i)}><Link to={makeCandidateUrl(c)}>{candidateNameParty(c)}</Link></span>
            })
            .reduce((prev, curr) => [prev, ', ', curr])
    }


    return <div className={styles.race}>
        <Link className={styles.raceHeaderLink} to={makeRaceUrl(race)}>
            <div className={styles.raceHeader}>            
                <div className={styles.flag}>{flagIcon}</div>
                {race.position}
            </div>
        </Link>
        
        <div className={styles.raceContents}>
            <p className={styles.description}>{race.description}</p>
            <div className={styles.candidates}>
                <span><strong>Candidates:</strong> </span>
                {candidatesRendered}
            </div>
        </div>
        
    </div>
}
