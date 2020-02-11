module.exports = {
  siteMetadata: {
    title: `Montana 2020`,
    description: `The MTFP guide to the 2020 Montana election`,
    author: `Eric Dietrich / Montana Free Press`,
    siteUrl:`https://www.montanafreepress.org/apps/montana-2020`,
    keywords: ['Montana','election','2020','votes','politics','U.S. Senate','Governor','U.S. House','congress']
  },
  // pathPrefix: `/apps/montana-2020`, // old hosting
  pathPrefix: `/montana-2020`, // for S3
  plugins: [
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `gatsby-starter-default`,
        short_name: `starter`,
        start_url: `/`,
        background_color: `#222222`,
        theme_color: `#222222`,
        display: `minimal-ui`,
        icon: `src/images/mtfp-icon.png`, // This path is relative to the root of the site.
      },
    },
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: "UA-70813941-1",
      },
    },
    `gatsby-plugin-webpack-size`,
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    // `gatsby-plugin-offline`,
  ],
}
