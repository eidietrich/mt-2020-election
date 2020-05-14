import React, { Component } from 'react'
import Layout from "../components/layout"
import SEO from '../components/seo'

import RaceFinance from '../components/RaceFinance'
import RaceIssues from '../components/RaceIssues' 
import RaceCandidateSummary from '../components/RaceCandidateSummary' 
import LinksList from '../library/LinksList'
import EmailFormElex from '../library/EmailFormElex.jsx'

import MoreToComeMessage from '../components/MoreToComeMessage'

class RacePage extends Component {
    render(){
        const {
            race,
            raceCandidates
        } = this.props.pageContext

        return (<Layout>
            <SEO
                title={`Montana's 2020 election | ${race.position}`}
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

            < EmailFormElex />

            <RaceIssues
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