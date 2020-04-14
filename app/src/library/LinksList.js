import React from 'react'

import {
    dateFormat
} from '../logic/config'

import styles from './LinksList.module.css'

// Handles null dates from improperly parsed links
const presentDate = date => date ? dateFormat(new Date(date)) : null

const dedupeTitles = (links) => {
    const sorted = links.sort((a,b) => new Date(b.date) - new Date(a.date))
    const uniqueTitles = Array.from(new Set(sorted.map(d => d.title)))
    return uniqueTitles.map(title => sorted.find(d => title === d.title))
}

const LinksList = (props) => {
    const { links, featuredFilter } = props
    
    if (links.length === 0) return <div className={styles.container}>
        <h2>Media coverage</h2>
        <div className={styles.note}>No stories currently in our database</div>
    </div> 

    const deduped = dedupeTitles(links)

    return <div className={styles.container}>
        <h2>Media coverage</h2>
        {
            deduped
                .filter(featuredFilter)
                .sort((a,b) => new Date(b.date) - new Date(a.date))
                .map((link, i) => <FeaturedLink 
                    key={String(i)}
                    url={link.link}
                    dek={link.publication}
                    title={link.title}
                    date={link.date}
                />)
        }
        {
            deduped
                .filter((d) => !featuredFilter(d)) // invert
                .sort((a,b) => new Date(b.date) - new Date(a.date))
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