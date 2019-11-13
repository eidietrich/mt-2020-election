import React from 'react'

import styles from './PullStats.module.css'

const PullStatMain = (props) => {
    return <div className={`${props.className} ${styles.primary}`}>
        <div className={styles.primaryStat} style={{fontWeight: 'bold'}}>{props.stat}</div>
        <div className={styles.primaryLabel}>{props.label}</div>
    </div>
}
export default PullStatMain 