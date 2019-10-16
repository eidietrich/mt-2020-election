import React from "react"
import { Link } from 'gatsby'

import Layout from "../components/layout"
import SEO from "../components/seo"

import TextBlock from '../library/TextBlock.js'

import { races, candidates, racePageText, racePageTitle } from '../data/app-copy.json'

import { makeRaceKey } from '../logic/functions.js'

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
    
    return <div>
        <h2><Link to={`/races/${makeRaceKey(race)}`}>{race.position}</Link></h2>
        <p>{race.description}</p>
        <p><Link to={`/races/${makeRaceKey(race)}`}>Race overview</Link></p>
    </div>
}