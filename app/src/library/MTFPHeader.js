import React from 'react'
import MTFPLogoFull from './MTFPLogoFull'

const styles = {
    header: {
        maxWidth: '1000px',
        margin: 'auto',
    },
    logoContainer: {
        maxWidth: '430px',
        margin: '30px auto',
    },
    navBar : {
        borderTop: '1px solid #ccc',
        borderBottom: '1px solid #ccc',
        paddingTop: '0.5em',
        paddingBottom: '0.5em',

        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    headerLink: {
        marginRight: '1em',
        marginLeft: '1em',
        fontSize: '13px',
        color: '#555',
        textTransform: 'uppercase',
        fontWeight: 'bold',
    },
}

const MTFPHeader = (props) => {
    return <header style={styles.header}>
        <div style={styles.logoContainer}><MTFPLogoFull /></div>
        <div style={styles.navBar}>
            <a style={styles.headerLink} href="https://montanafreepress.org/">Home</a>
            <a style={styles.headerLink} href="https://montanafreepress.org/sign-up/">Subscribe</a>
            <a style={styles.headerLink} href="https://checkout.fundjournalism.org/memberform?org_id=montanafreepress&campaign=7013s000000mfEdAAI">Donate</a>
        </div>
    </header>
}
export default MTFPHeader 