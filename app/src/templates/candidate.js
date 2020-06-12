import React, { Component } from 'react'
import { Link } from 'gatsby'
import Layout from "../components/layout"
import SEO from '../components/seo'

import CandidateSummary from '../components/CandidateSummary'
import CandidateFinance from '../components/CandidateFinance' 
import CandidateIssuesPrimary from '../components/CandidateIssuesPrimary'

import MoreToComeMessage from '../components/MoreToComeMessage'

import LinksList from '../library/LinksList'
import EmailFormElex from '../library/EmailFormElex'


// import { } from '../logic/config.js'
import { 
    makeCandidateUrl,
    makeCandidateKey,
    makeRaceUrl,
    candidateNameParty,
    getCandidateParty,
} from '../logic/functions.js'
import { excludeStatuses } from '../logic/config.js'
import { filterToActive, failedPrimary } from '../logic/functions.js'

import { candidates } from '../data/app-copy.json' // TODO: Replace this with gatsby-node logic

import styles from './candidate.module.css'

class CandidatePage extends Component {
    render(){
        const {
            candidate,
            race,
        } = this.props.pageContext

        const competitors = filterToActive(candidates)
            .filter(d => !race.districts || (candidate.district === d.district)) // same-district candidates
            .filter(c => c.position === race.position)
            .filter(c => makeCandidateKey(c) !== makeCandidateKey(candidate))

        const party = getCandidateParty(candidate)
        
        return (<Layout>
            <SEO
                title={`Montana's 2020 election | ${candidate.first_name} ${candidate.last_name}`}
                description={candidate.text}
            />

            <div className={styles.header} style={{backgroundColor: party.color}}>
                    {party.name} for {candidate.position}
            </div>

            <div className={styles.primaryLoss}>
                {failedPrimary(candidate) ? '(Lost in June primary)' : null}
              </div>

            <CandidateSummary candidate={candidate}/>

            <div className={styles.text}>
                <div className={styles.race}>
                    <strong>Race overview:</strong> <Link to={makeRaceUrl(race)}>2020 {race.position}</Link>
                </div>
                <div className={styles.competitors}>
                    <span><strong>Other candidates:</strong> </span>
                    {
                        
                        (competitors.length > 0) ?
                        competitors.map((c, i) => {
                            return <span key={String(i)}><Link to={makeCandidateUrl(c)}>{candidateNameParty(c)}</Link></span>
                            })
                            .reduce((prev, curr) => [prev, ', ', curr])
                        : '(None)'
                    }

                </div>
                
            </div>
            
            <EmailFormElex />

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

            <CandidateIssuesPrimary
                candidate={candidate}
                race={race}
                color={party.color}
            />
            <hr />

           

            

            <MoreToComeMessage />  

            
        </Layout>);
    }
  }


export default CandidatePage

