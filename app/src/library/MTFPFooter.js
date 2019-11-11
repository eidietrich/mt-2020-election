import React from 'react'
import MTFPLogo from './MTFPLogo.js'

import EmailForm from './EmailForm'

import styles from './MTFPFooter.module.css'

const MTFPFooter = (props) => {
    const donateUrl = props.donateUrl || 'https://montanafreepress.org'
    return <footer className={styles.Footer}>
        <div className={styles.support}>
            Find this useful? <a href={donateUrl}>Support</a> our nonprofit journalism.
        </div>
        <div className={styles.logo}>
            <MTFPLogo />
        </div>

        <div className={styles.email}>
            <EmailForm />
        </div>
        

        <div className={styles.copyright}
            >© <a href="https://montanafreepress.org">Montana Free Press</a> {new Date().getFullYear()}
        </div>
        
    </footer>
}
export default MTFPFooter 