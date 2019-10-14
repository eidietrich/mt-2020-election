/**
 * Layout component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React from "react"
import PropTypes from "prop-types"

import Footer from '../library/MTFPFooter'
import Header from '../library/MTFPHeader'


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
  },
  appHed: {
    fontSize: '3em',
    fontWeight: 'bold',
    marginBottom: '0.3em',
  },
  appSubhed: {
    fontSize: '1.5em',
    marginBottom: '0.3em',
  }
}

const options = ['A','B','C']

const Layout = ({ children }) => {
  return (
    <>
      <Header />
      <div style={styles.body}>
        <div style={styles.appHeader}>
          <div style={styles.appHed}>Montana's 2020 election</div>
          <div style={styles.appSubhed}>A citizen's guide by the Montana Free Press</div>
          <div>
            
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
