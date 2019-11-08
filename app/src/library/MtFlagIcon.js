import React from 'react'
import { useStaticQuery, graphql } from 'gatsby'
import Img from "gatsby-image"

const MtFlagIcon = (props) => {
    const icon = useStaticQuery(graphql`
        query {
        placeholderImage: file(relativePath: { eq: "mt-flag-150px.png" }) {
            childImageSharp {
                fluid(maxWidth: 150) {
                    ...GatsbyImageSharpFluid
                }
            }
        }
        }
    `)
    return <Img fluid={icon.placeholderImage.childImageSharp.fluid} />

}
export default MtFlagIcon