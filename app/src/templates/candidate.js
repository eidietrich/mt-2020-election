import React, { Component } from 'react'
import { Link } from 'gatsby'
import Layout from "../components/layout"
import SEO from '../components/seo'

import CandidateSummary from '../components/CandidateSummary'
import CandidateFinance from '../components/CandidateFinance' 
import CandidateIssues from '../components/CandidateIssues'

import MoreToComeMessage from '../components/MoreToComeMessage'

import LinksList from '../library/LinksList'

// import { } from '../logic/config.js'
import { 
    makeCandidateUrl,
    makeCandidateKey,
    makeRaceUrl,
    candidateNameParty,
    getCandidateParty,
} from '../logic/functions.js'
import { excludeStatuses, hasIssueAnswers } from '../logic/config.js'

import { candidates } from '../data/app-copy.json' // TODO: Replace this with gatsby-node logic

import styles from './candidate.module.css'

class CandidatePage extends Component {
    render(){
        const {
            candidate,
            race,
        } = this.props.pageContext

        const competitors = candidates
            .filter(d => !excludeStatuses.includes(d.status))
            .filter(c => c.position === race.position)
            .filter(c => makeCandidateKey(c) !== makeCandidateKey(candidate))

        const party = getCandidateParty(candidate)
        const positionKey = candidate.position.replace(/\s/g, '-')

        return (<Layout>
            <SEO
                title={`${candidate.last_name} | Montana 2020`}
                description={candidate.text}
            />

            <div className={styles.header} style={{backgroundColor: party.color}}>
                    {party.name} for {candidate.position}
            </div>

            <CandidateSummary candidate={candidate}/>

            <div className={styles.text}>
                <div className={styles.competitors}>
                    <span><strong>Competitors:</strong> </span>
                    {competitors.map((c, i) => {
                        // const url = `/candidates/${makeCandidateKey(c)}`
                        return <span key={String(i)}><Link to={makeCandidateUrl(c)}>{candidateNameParty(c)}</Link></span>
                        })
                        .reduce((prev, curr) => [prev, ', ', curr])
                    }
                </div>
                <div className={styles.race}>
                    <strong>Race overview:</strong> <Link to={makeRaceUrl(race)}>2020 {race.position}</Link>
                </div>
            </div>
            
            <hr /> 

            <CandidateIssues
                candidate={candidate}
                race={race}
                color={party.color}
            />
            <hr />

            <CandidateFinance 
                candidate={candidate}
                race={race}
            />
            <hr />

            <LinksList
                links={candidate.coverageLinks}
                featuredFilter={(link) => link.candidate_page_featured === 'yes'}
            />

            <hr />

            <MoreToComeMessage />  

            
        </Layout>);
    }
  }


export default CandidatePage