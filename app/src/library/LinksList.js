import React from 'react'

import {
    dateFormat
} from '../logic/config'

import styles from './LinksList.module.css'

// Handles null dates from improperly parsed links
const presentDate = date => date ? dateFormat(new Date(date)) : null

const LinksList = (props) => {
    const { links, featuredFilter } = props
    if (links.length === 0) return <div className={styles.container}>
        <h2>Media coverage</h2>
        <div className={styles.note}>No stories currently in our database</div>
    </div> 

    return <div className={styles.container}>
        <h2>Media coverage</h2>
        {
            links
                .filter(featuredFilter)
                .map((link, i) => <FeaturedLink 
                    key={String(i)}
                    url={link.link}
                    dek={link.publication}
                    title={link.title}
                    date={link.date}
                />)
        }
        {
            links
                .filter((d) => !featuredFilter(d)) // invert
                .map((link, i) => <BasicLink
                    key={String(i)}
                    url={link.link}
                    dek={link.publication}
                    title={link.title}
                    date={link.date}
                />)
        }
    </div>
}
export default LinksList 

const FeaturedLink = (props) => {
    const { url, dek, title, date } = props
    return <a className={`${styles.link} ${styles.featured}`} href={url}>
        <div className={styles.dek}>{dek}</div>
        <div className={styles.title}>{title}</div>
        <div className={styles.date}>{presentDate(date)}</div>
    </a>

}

const BasicLink = (props) => {
    const { url, dek, title, date } = props
    return <a className={`${styles.link} ${styles.basic}`} href={url}>
        <div className={styles.dek}>{dek}</div>
        <div className={styles.title}>{title}</div>
        <div className={styles.date}>{presentDate(date)}</div>
    </a>
}