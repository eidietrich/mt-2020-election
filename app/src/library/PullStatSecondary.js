import React from 'react'

import styles from './PullStats.module.css'

const PullStatSecondary = (props) => {
    return <div className={styles.secondary}>
        <div className={styles.secondaryStat}>{props.stat}</div>
        <div className={styles.secondaryLabel}>{props.label}</div>
    </div>
}
export default PullStatSecondary