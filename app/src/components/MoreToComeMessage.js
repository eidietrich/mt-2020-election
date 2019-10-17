import React from "react"

import { checkBackHed, checkBackSectionText } from '../data/app-copy.json'

import TextBlock from '../library/TextBlock.js'

import styles from './MoreToComeMessage.module.css'

const MoreToComeMessage = (props) => {
    return (
        <div className={styles.Message}>
            {/* <div>XXX</div> */}
            <h2>{checkBackHed}</h2>
            <TextBlock paragraphs={checkBackSectionText} />
            {/* {/* <p>We'll be updating this page with additional information through the general election in November 2020.</p> */}
            {/* <p>Have ideas about what types of coverage would be helpful to you as you consider how you'll vote? Tell us about them at <a href="mailto:info@montanafreepress.org">info@montanafreepress.org</a></p> */}
        </div>
    )
}

export default MoreToComeMessage
