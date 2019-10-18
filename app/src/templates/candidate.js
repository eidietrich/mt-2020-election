import React, { Component } from 'react'
import { Link } from 'gatsby'
import Layout from "../components/layout"
import SEO from '../components/seo'

import CandidateFinanceState from '../components/CandidateFinanceState' 
import CandidateFinanceFederal from '../components/CandidateFinanceFederal' 
import CandidateSummary from '../components/CandidateSummary'
import MoreToComeMessage from '../components/MoreToComeMessage'

// import { } from '../logic/config.js'
import { makeCandidateUrl, makeCandidateKey, makeRaceUrl, candidateNameParty } from '../logic/functions.js'
import { excludeStatuses } from '../logic/config.js'

import { candidates } from '../data/app-copy.json' // TODO: Replace this with gatsby-node logic

import styles from './candidate.module.css'

class CandidatePage extends Component {
    constructor(props){
        super(props)
        // this.state = {}
    }
    render(){
        const {
            candidate,
            race,
        } = this.props.pageContext
        console.log(this.props.pageContext)
        // console.log(candidateSummary)

        const competitors = candidates
            .filter(d => !excludeStatuses.includes(d.status))
            .filter(c => c.position === race.position)
            .filter(c => makeCandidateKey(c) !== makeCandidateKey(candidate))

        const jurisdiction = 'state' // TEMP

        return (<Layout>
            <SEO
                title={`${candidate.last_name} | Montana 2020`}
                description={`TK`}
            />
            <CandidateSummary candidate={candidate}/>

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
            <hr /> 
            
            {(jurisdiction === 'state') ?
                <CandidateFinanceState 
                    candidate={candidate}
                /> :
                <div>Federal</div>
            }

            <MoreToComeMessage />  

            
        </Layout>);
    }
  }


export default CandidatePage