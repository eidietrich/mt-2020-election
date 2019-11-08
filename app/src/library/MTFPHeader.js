import React from 'react'
import MTFPLogo from './MTFPLogo'

const styles = {
    header: {
        maxWidth: '1000px',
        margin: 'auto',
        borderBottom: '6px solid #222',
        // flexbox
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-end',

    },
    logoContainer: {
        width: '230px',
        marginRight: '20px',
        marginBottom: '10px',
    },
    linkContainer : {
        display: 'flex',
        marginTop: '5px',
        marginBottom: '5px',
        marginLeft: '5px',
    },
    headerLink: {
        marginRight: '20px',
        color: '#222',
        textTransform: 'uppercase',
        fontWeight: 'bold',
    },
}

const MTFPHeader = (props) => {
    return <header style={styles.header}>
        <div style={styles.logoContainer}><MTFPLogo /></div>
        <div style={styles.linkContainer}>
            <a style={styles.headerLink} href="https://montanafreepress.org/">Home</a>
            <a style={styles.headerLink} href="https://montanafreepress.org/sign-up/">Subscribe</a>
            <a style={styles.headerLink}href="https://montanafreepress.org/donate/">Donate</a>
        </div>
        {/* <div styles={styles.linkContainer}>
            <Link style={styles.headerLink} to={`/`}>Tracking MTLeg 2019</Link>
            <Link style={styles.headerLink} to={`/lawmakers`}>✓Lawmakers</Link>
            <Link style={styles.headerLink} to={`/bills`}>✓Bills</Link>
            <Link style={styles.headerLink} to={`/governor`}>✓Gov. action</Link>
        </div> */}
    </header>
}
export default MTFPHeader 