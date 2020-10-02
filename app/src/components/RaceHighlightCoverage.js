import React from 'react'

import MicIcon from '../library/MicIcon'
import VidIcon from '../library/VidIcon'


import styles from './RaceHighlightCoverage.module.css'



const RaceHighlightCoverage = (props) => {
    const {race} = props
    const links = race.highlightLinks

    const feature = links
      .find(d => d.type === 'race-profile')

    const secondaries = links
      .filter(d => d.type !== 'race-profile')

    return <div className={styles.RaceHighlightCoverage}>
      <h2>Key coverage in the race for {race.position}</h2>
      <div className={styles.storyContainer}>
        <Feature hed={feature.hed} excerpt={feature.subhed} link={feature.link}/>
        <div className={styles.secondaries}>
          {secondaries.map((d,i) => <Secondary
            key={i}
            type={d.type}
            hed={d.hed}
            excerpt={d.subhed}
            link={d.link}
          />)}
        </div>
      </div>
    </div>
}
export default RaceHighlightCoverage

const Feature = (props) => {
  const { hed, excerpt, link } = props
  return <div className={styles.feature}>
    <h3 className={styles.hed}><a href={link}>{hed}</a></h3>
    {/* <div>Image here?</div> */}
    <div className={styles.excerpt}>{excerpt}</div>
    <div><a href={link}>Read full MTFP race profile</a></div>
  </div>
}

const icons = {
  audio: <MicIcon size={16}/>,
  video: <VidIcon size={16}/>,
}

const Secondary = (props) => {
  const { type, hed, excerpt, link } = props
  const icon = icons[type]

  return <div className={styles.secondary}>
    <h4 className={styles.hed}><a href={link}>{hed}</a></h4>
    <div className={styles.excerpt}>
      <span className={styles.icon}>{icon}</span>
      <span > {excerpt}</span>
    </div>
    
    <div><a href={link}>See more</a></div>
  </div>
}
