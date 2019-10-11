import React, { Component } from 'react'
import { Link } from 'gatsby'
import Layout from "../components/layout"
import SEO from '../components/seo'

import CampaignFinanceState from '../components/CampaignFinanceState' 
import CampaignFinanceFederal from '../components/CampaignFinanceFederal' 

// import { } from '../logic/config.js'
import { getCandidateParty } from '../logic/functions.js'

// import styles from './single-lawmaker-page.module.css'

class CandidatePage extends Component {
    constructor(props){
        super(props)
        // this.state = {}
    }
    render(){
        const { candidate,
            stateContributions, 
            stateExpenditures,
        } = this.props.pageContext
        const party = getCandidateParty(candidate)

        const jurisdiction = 'state'

        // console.log(this.props.pageContext)
        
        return (<Layout>
            <SEO
                title={`${candidate.last_name} | Montana 2020`}
                description={`TK`}
            />
            <Link to='/'>All candidates</Link>
            <h1>{`${candidate.first_name} ${candidate.last_name}`}</h1>
            <h2>Summary info</h2>
            <div>{party.name} for {candidate.position}</div>
            <div>Links to Dem/GOP opponents' pages </div>
            <div>Status: "Incumbent", "Challenger", "Running against 3 opponents in GOP primary" etc.</div>
            <hr />   
            <p><em>The following could be tabs/sections etc. We probably don't have the capacity to do everything sketched out here.</em></p>
            
            <h2>TK: Campaign finance</h2>
            {/* <CampaignFinance jurisdiction={jurisdiction} /> */}
            {(jurisdiction === 'state') ?
                <CampaignFinanceState 
                    candidate={candidate}
                    contributions={stateContributions}
                    expenditures={stateExpenditures}
                /> :
                <div>Federal</div>
            }
            <p>Need to figure out data sourcing here. Will have to treat state/federal elections separately. Sketch out/develop appropriate data viz.</p>     
            
            

            <h2>TK: Biographical info</h2> 
            <p>Will have to report/compile for each candidate</p>

            <h2>TK: Issue stances</h2> 
            <p>Where the candidate stands on key issues</p>

            <h2>TK: Candidate statements</h2> 
            <p>What the candidate has said over the course of the campaign. Curate from Twitter/FB/Press releases somehow?</p>

            <h2>TK: Primary & General Election Results</h2> 
            <p>Only include after we get election results</p>

            <h2>TK: Candidate record</h2>
            <p>2019 voting record for current state legislators (link to page in legislative tracker), ??? for non-state legislators </p>

            <h2>TK: MTFP news coverage of the candidate</h2>
            <p>We can set this up to populate automatically from our CMS based on tags with the candidate name. We could also feature podcasts in this section.</p>

            <h2>TK: Curated coverage from other organizations</h2>
            <p>We'll have to curate this by hand, most likely - easiest way is to set up a Gdoc spreadsheet of links relevant to specific candidates</p>
        </Layout>);
    }
  }


export default CandidatePage

const CampaignFinance = (props) => {
    // return <div>This is campaign fin</div>
    const { jurisdiction } = props
    if (jurisdiction === 'state') { return <div>This is campaign fine</div> }
    // if (jurisdiction === 'federal') { return <CampaignFinanceFederal /> }
}