import React from 'react'

const PullStatMain = (props) => {
    return <div className="pull-stat-main-container" style={{fontSize: '1.2em'}}>
        <div className="stat" style={{fontWeight: 'bold'}}>{props.stat}</div>
        <div className="label">{props.label}</div>
    </div>
}
export default PullStatMain 