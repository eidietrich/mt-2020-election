import React from 'react'
import PullStatSecondary from './PullStatSecondary'

const PullStatSecondaryRow = (props) => {
    // horizontal flexbox array of secondary pull stats
    const stats = props.stats.map((stat, i) => 
    <PullStatSecondary key={String(i)}
        stat={stat.stat} label={stat.label}/>
        )
    return <div className="pull-stat-secondary-row">
        {stats}
    </div>
}
export default PullStatSecondaryRow