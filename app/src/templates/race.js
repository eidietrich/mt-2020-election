import React, { Component } from 'react'
import Layout from "../components/layout"
import SEO from '../components/seo'

import RaceFinance from '../components/RaceFinance'
// import RaceIssues from '../components/RaceIssues' 
import RacePrimaryResults from '../components/RacePrimaryResults'
import RaceCandidateSummary from '../components/RaceCandidateSummary' 
import RaceHighlightCoverage from '../components/RaceHighlightCoverage'
import LinksList from '../library/LinksList'
import EmailFormElex from '../library/EmailFormElex.jsx'


import MoreToComeMessage from '../components/MoreToComeMessage'

import { filterToActive } from '../logic/functions.js'

class RacePage extends Component {
    render(){
        const {
            race,
            raceCandidates,
        } = this.props.pageContext

        const candidates = filterToActive(raceCandidates)

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
                candidates={candidates}
            />

            {(race.highlightLinks.length > 0) ? <RaceHighlightCoverage race={race} /> : null}

            <EmailFormElex />

            {/* <RaceIssues
                race={race}
                candidates={candidates}
            /> */}
            <hr />

            <RaceFinance
                race={race}
                candidates={candidates}
            />

            <hr />
            <RacePrimaryResults 
                race={race}
                candidates={candidates}
            />

            <hr />
            <LinksList
                links={race.coverageLinks}
                featuredFilter={(link) => link.race_page_featured === 'yes'}
            />
            
            <MoreToComeMessage />
        </Layout>);
    }
}
export default RacePage