import React from 'react'

import MicIcon from './MicIcon'

import styles from './PodcastLink.module.css'

const PodcastLink = (props) => {
    const { podcastUrl } = props
    console.log('pc', podcastUrl)
    return <a className={styles.PodcastLink} href={podcastUrl}>
        <MicIcon className={styles.icon} size={16}/>
        <span className={styles.text}>On the Montana Lowdown Podcast</span>
    </a>
  }
export default PodcastLink