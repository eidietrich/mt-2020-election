/**
 * Layout component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React from "react"
import PropTypes from "prop-types"
import { Link } from 'gatsby'

import Footer from '../library/MTFPFooter'
import Header from '../library/MTFPHeader'

import text from '../data/app-copy.json'

import "./default.css" // from Gatsby default
import "./app.css"

const styles = {
  body: {
    margin: `10px auto`,
    maxWidth: 1000,
    padding: `0px 5px`,
    paddingTop: 0,
  },
  appHeader: {
    backgroundColor: '#222',
    color: '#fff',
    textAlign: 'center',
    padding: '1.2em',
    marginBottom: '0.5em'
  },
  appHed: {
    fontSize: '3em',
    lineHeight: '1em',
    fontWeight: 'bold',
    marginBottom: '0.3em',
  },
  appSubhed: {
    fontSize: '1.5em',
    marginBottom: '0.5em',
  },
  navBar: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  navItem: {
    border: '1px solid #ddd',
    color: 'white',
    padding: '0.3rem',
    margin: '0.2rem',
  }
}

const Layout = ({ children }) => {
  return (
    <>
      <Header />
      <div style={styles.body}>
        <div style={styles.appHeader}>
          <div style={styles.appHed}>{text.appHed}</div>
          <div style={styles.appSubhed}>{text.appSubhed}</div>
          <div style={styles.navBar}>
            <Link style={styles.navItem} to='/'>Overview</Link>
            <Link style={styles.navItem} to='/races'>Races</Link>
            <Link style={styles.navItem} to='/candidates'>Candidates</Link>
          </div>
        </div>
        <main>{children}</main>
      </div>
      <Footer />
    </>
  )
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
