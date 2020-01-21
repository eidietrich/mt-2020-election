import React, { Component } from 'react'
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
            sortColumn: {
                sortFunction: this.props.defaultSort || (() => true)
            },
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
                sortAscending: !this.state.sortAscending
            })
        }
    }

    makeRow(d, i){
        const rowClasses = this.props.rowClassTests && this.props.rowClassTests.map(test => test(d))
        console.log(rowClasses.join(' '))
        const cells = this.props.columns.map(schema => {
            return <td
                key={schema.header}
                className={`${styles.cell} ${schema.style}`}
                >
                {schema.content(d)}
            </td>
        })
        return <tr key={String(i)}
            className={`${styles.row} ${rowClasses.join(' ')}`}>
            {cells}
        </tr>
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
            
            return <th
                key={schema.header}
                className={`${styles.headerCell} ${schema.style}`}
                onClick={this.makeSortHandler(schema)}
                >
                <span className={sortClass}>{schema.header}</span>
            </th>
        })
        const rows = sortedData.map(this.makeRow)
        return (<table className={styles.table}>
            <thead>
                <tr className={styles.header}>{headers}</tr>
            </thead>
            <tbody>{rows}</tbody>
            {/* <div className={styles.rowsContainer}>{rows}</div> */}
        </table>);
    }
}

export default Table