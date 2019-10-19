import React, { Component } from 'react'
import { Link } from 'gatsby'
import Layout from "../components/layout"
import SEO from '../components/seo'

import RaceFinanceState from '../components/RaceFinanceState' 
import RaceCandidateSummary from '../components/RaceCandidateSummary' 

import MoreToComeMessage from '../components/MoreToComeMessage'

// import CampaignFinanceFederal from '../components/CandidateFinanceFederal'  // TK
// import CandidateSummary from '../components/CandidateSummary'

// import { } from '../logic/config.js'
// import { getCandidateParty } from '../logic/functions.js'

// import styles from './single-lawmaker-page.module.css'

class RacePage extends Component {
    render(){
        const {
            race,
            raceCandidates
        } = this.props.pageContext

        return (<Layout>
            <SEO
                title={`${race.position} | Montana 2020`}
                description={`TK`}
            />
            <h1>{race.position}</h1>
            <p>{race.description}</p>
            <h2>Current candidates</h2>
            <RaceCandidateSummary
                race={race}
                candidates={raceCandidates}
            />
            <hr />
            <RaceFinanceState
                race={race}
                candidates={raceCandidates}
            />
            <hr />
            <MoreToComeMessage />
        </Layout>);
    }
}
export default RacePage