import React from "react"
import { Link, navigate } from 'gatsby'

import Layout from "../components/layout"
import SEO from "../components/seo"

import CandidateMug from '../components/CandidateMug.js'

import Table from '../library/Table.js'
import tableStyles from '../library/Table.module.css'

import { excludeStatuses } from '../logic/config.js'
import { getCandidateParty, makeCandidateUrl, cleanDisplayUrl, makeRaceUrl } from '../logic/functions.js'

import { candidates } from '../data/app-copy.json'

const candidateTableColumns = [
  {
    key: 'mug',
    header: '',
    content: d => <CandidateMug
      candidate={d}
      party={getCandidateParty(d)}
      suppressLabel
      handleSelect={() => navigate(makeCandidateUrl(d))}
    />,
    style: tableStyles.thumbnailCol,
    sortFunction: null,
  },
  {
    key: 'name',
    header: 'Candidate',
    content: d => <Link to={makeCandidateUrl(d)}>{d.first_name} {d.last_name}</Link>,
    style: tableStyles.nameCol,
    sortFunction: null,
  },
  {
    key: 'race',
    header: 'Race',
    content: d => <Link to={makeRaceUrl(d)}>{d.position}</Link>,
    style: tableStyles.textCol,
    sortFunction: null,
  },
  {
    key: 'party',
    header: 'Party',
    content: d => `${getCandidateParty(d).name}`,
    style: tableStyles.partyCol,
    sortFunction: null,
  },
  {
    
    key: 'website',
    header: 'Campaign website',
    content: d => <a href={`${d.web_url}`}>{cleanDisplayUrl(d.web_url || '')}</a>,
    style: tableStyles.linkCol,
    sortFunction: null,
  }
]

const Candidates = () => {
  const useCandidates = candidates.filter(d => !excludeStatuses.includes(d.status))

  return <Layout>
    <SEO title="Montana 2020 election candidates" />
    <div style={{maxWidth: 800, margin: 'auto'}}>
      <Table
        rowData={useCandidates}
        columns={candidateTableColumns}
      />
    </div>
  </Layout>
}

export default Candidates