import React from 'react'
import { useStaticQuery, graphql } from "gatsby"
import Img from "gatsby-image"

/* ADAPTED From standard Gatsby image 
 *
 * This component is built using `gatsby-image` to automatically serve optimized
 * images with lazy loading and reduced file sizes. The image is loaded using a
 * `useStaticQuery`, which allows us to load the image from directly within this
 * component, rather than having to pass the image data down from pages.
 *
 * For more information, see the docs:
 * - `gatsby-image`: https://gatsby.dev/gatsby-image
 * - `useStaticQuery`: https://www.gatsbyjs.org/docs/use-static-query/
 */

// Assumes logo file at specified in images/ folder

const Logo = () => {
  const data = useStaticQuery(graphql`
    query {
      images: allFile(filter: {relativePath: {eq: "mtfp-logo.png"}}) {
            edges {
                node {
                    relativePath
                    childImageSharp {
                        fluid(maxWidth: 230) {
                            ...GatsbyImageSharpFluid
                        }
                    }
                }
            }
        }
    }
  `)
  return <a href="https://montanafreepress.org"><Img fluid={data.images.edges[0].node.childImageSharp.fluid} /></a>
}
export default Logo