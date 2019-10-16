import React, { Component } from 'react'
import { Link } from 'gatsby'

import styles from './Table.module.css';

 /*
Expects columns config
const columns = [
    {
        key: 'name',
        header: 'Lawmaker',
        content: d => `${d.name} (${d.party})`,
        style: styles.nameCol,
        sortFunction: sortByLawmakerName
    },
    {
        key: 'district',
        header: 'District',
        content: d => `${d.district} / ${d.city}`,
        style: styles.districtCol,
        sortFunction: sortByDistrict,
    },
    {
        key: 'bills',
        header: 'Bills sponsored',
        content: d => d.numSponsoredBills,
        
        style: styles.billNumCol,
        sortFunction: null,
    },
    {
        key: 'majorityVote',
        header: 'Votes with majority of body',
        content: d => percentFormat(d.percentVotesWithMajority),
        style: styles.votePercentCol,
        sortFunction: sortByLawmakerValue('percentVotesWithMajority'),
    },
    {
        key: 'gopVote',
        header: 'Votes with GOP caucus',
        content: d => percentFormat(d.percentVotesWithGopCaucus),
        style: styles.votePercentCol,
        sortFunction: sortByLawmakerValue('percentVotesWithGopCaucus'),
    },
    {
        key: 'demVote',
        header: 'Votes with Dem. caucus',
        content: d => percentFormat(d.percentVotesWithDemCaucus),
        style: styles.votePercentCol,
        sortFunction: sortByLawmakerValue('percentVotesWithDemCaucus'),
    },
]

*/

class Table extends Component {
    constructor(props){
        super(props)
        this.state = {
            sortColumn: this.props.defaultSort || (() => true),
            sortAscending: true,
        }
        this.makeSortHandler = this.makeSortHandler.bind(this)
        this.makeRow = this.makeRow.bind(this)
    }

    makeSortHandler(column){
        if (column.sortFunction === null) return null // catches null sort function
        return () => {
            this.setState({
                sortColumn: column,
                sortAscending: !this.state.ascending
            })
        }
    }

    makeRow(d, i){
        const cells = this.props.columns.map(schema => {
            return <div
                key={schema.header}
                className={schema.style}
                >
                {schema.content(d)}
            </div>
        })
        return <div key={String(i)} className={styles.row}>{cells}</div>
    }
    
    render() {
        const { rowData, columns } = this.props
        const { sortColumn, sortAscending} = this.state

        const sortFunction = sortAscending ?
            sortColumn.sortFunction :
            (a,b) => sortColumn.sortFunction(b,a) // reverses sort
        const sortedData = rowData
            .sort(sortFunction)
        
        const headers = columns.map(schema => {

            let sortClass = styles.colSortable
            // non-sortable column
            if (schema.sortFunction === null) sortClass = styles.colNotSortable
            // active sort column, ascending or descending
            else if (schema.key === sortColumn.key && sortAscending) sortClass = `${styles.colSortable} ${styles.colActiveSortAsc}`
            else if (schema.key === sortColumn.key && !sortAscending) sortClass = `${styles.colSortable} ${styles.colActiveSortDesc}`
            
            return <div
                key={schema.header}
                className={`${schema.style}`}
                onClick={this.makeSortHandler(schema)}
                >
                <span className={sortClass}>{schema.header}</span>
            </div>
        })
        const rows = sortedData.map(this.makeRow)
        return (<div className={styles.table}>
            <div className={styles.header}>{headers}</div>
            <div className={styles.rowsContainer}>{rows}</div>
        </div>);
    }
}

export default Table