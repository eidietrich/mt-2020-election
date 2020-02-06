/**
 * Layout component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React from "react"
import PropTypes from "prop-types"
import { Link, useStaticQuery, graphql } from 'gatsby'
import Img from "gatsby-image"

import SupportUsAd from '../library/SupportUsAd'
import Footer from '../library/MTFPFooter'
import Header from '../library/MTFPHeader'

import text from '../data/app-copy.json'

import "./default.css" // from Gatsby default
import "./app.css"

import styles from './layout.module.css'

const Layout = ({ children }) => {
  const heroImage = useStaticQuery(graphql`
    query {
      placeholderImage: file(relativePath: { eq: "pen-on-ballot.png" }) {
        childImageSharp {
          fluid(maxWidth: 1000) {
            ...GatsbyImageSharpFluid
          }
        }
      }
    }
  `)
  return (
    <>
      <Header />
      <div className={styles.body}>
        <div className={styles.appHeader}>
          <div className={styles.hero}>
            <Img 
              fluid={heroImage.placeholderImage.childImageSharp.fluid}
              className={styles.heroImage}
            />
            <div className={styles.heroText}>
              <div className={styles.appHed}>{text.appHed}</div>
              <div className={styles.appSubhed}>{text.appSubhed}</div>
            </div>
          </div>
          <div className={styles.navBar}>
            <Link className={styles.navItem} to='/'>Overview</Link>
            <Link className={styles.navItem} to='/races'>Races</Link>
            <Link className={styles.navItem} to='/candidates'>Candidates</Link>
          </div>
        </div>
        
        <main>{children}</main>
      </div>
      <SupportUsAd url='https://checkout.fundjournalism.org/memberform?org_id=montanafreepress&campaign=7013s000000mcU8AAI' />
      <Footer donateUrl='https://checkout.fundjournalism.org/memberform?org_id=montanafreepress&campaign=7013s000000mcU8AAI'/>
    </>
  )
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
