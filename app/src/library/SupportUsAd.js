import React from 'react'
import { useStaticQuery, graphql } from "gatsby"
import Img from "gatsby-image"

const SupportUsAd = (props) => {
    const { url } = props
    const data = useStaticQuery(graphql`
        query {
        images: allFile(filter: {relativePath: {eq: "support-mtfp.png"}}) {
                edges {
                    node {
                        relativePath
                        childImageSharp {
                            fluid(maxWidth: 728) {
                                ...GatsbyImageSharpFluid
                            }
                        }
                    }
                }
            }
        }
  `)
  const fluidImage = data.images.edges[0].node.childImageSharp.fluid
  return <div style={{maxWidth: 728, margin: '1em auto'}}>
      <a href={url}>
        <Img fluid={fluidImage} fadeIn durationFadeIn={100}/>
    </a>
  </div>
  
}
export default SupportUsAd