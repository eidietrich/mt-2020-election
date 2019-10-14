import React from 'react'

const PullStatSecondary = (props) => {
    return <div className="pull-stat-secondary-container">
        <div className="stat" style={{fontWeight: 'bold'}}>{props.stat}</div>
        <div className="label">{props.label}</div>
    </div>
}
export default PullStatSecondary