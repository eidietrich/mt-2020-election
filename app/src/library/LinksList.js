import React from 'react'

import {
    dateFormat
} from '../logic/config'

import styles from './LinksList.module.css'

const LinksList = (props) => {
    const { links, featuredFilter } = props
    // console.log(links)
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
    console.log(date)
    return <a className={`${styles.link} ${styles.featured}`} href={url}>
        <div className={styles.dek}>{dek}</div>
        <div className={styles.title}>{title}</div>
        <div className={styles.date}>{dateFormat(new Date(date))}</div>
    </a>

}

const BasicLink = (props) => {
    const { url, dek, title, date } = props
    return <a className={`${styles.link} ${styles.basic}`} href={url}>
        <div className={styles.dek}>{dek}</div>
        <div className={styles.title}>{title}</div>
        <div className={styles.date}>{dateFormat(new Date(date))}</div>
    </a>
}