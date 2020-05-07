import React, { Component } from 'react'
import Layout from "../components/layout"
import SEO from '../components/seo'

import RaceFinance from '../components/RaceFinance' 
import RaceCandidateSummary from '../components/RaceCandidateSummary' 
import LinksList from '../library/LinksList'

import MoreToComeMessage from '../components/MoreToComeMessage'

class RacePage extends Component {
    render(){
        const {
            race,
            raceCandidates
        } = this.props.pageContext

        return (<Layout>
            <SEO
                title={`${race.position} | Montana 2020`}
                description={race.description}
            />
            <h1>{race.position}</h1>
            <div className="text">
                <p>{race.description}</p>
            </div>
            
            <h2>Candidates</h2>
            <RaceCandidateSummary
                race={race}
                candidates={raceCandidates}
            />
            <hr />
            <RaceFinance
                race={race}
                candidates={raceCandidates}
            />
            <hr />
            <LinksList
                links={race.coverageLinks}
                featuredFilter={(link) => link.race_page_featured === 'yes'}
            />
            <hr />
            <MoreToComeMessage />
        </Layout>);
    }
}
export default RacePage