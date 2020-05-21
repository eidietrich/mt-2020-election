module.exports = {
  siteMetadata: {
    title: `Montana Free Press`,
    description: `The MTFP guide to the 2020 Montana election`,
    author: `Eric Dietrich / Montana Free Press`,
    siteUrl:`https://www.apps.montanafreepress.org/montana-2020`,
    keywords: ['Montana','election','candidates','2020','vote',
      'politics','U.S. Senate','Governor','U.S. House','congress','Public Service Commission',
      'Attorney General','Superintendent of Public Instruction','Secretary of State','State Auditor',
    ]
  },
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
      resolve: `gatsby-plugin-google-gtag`,
      options: {
        trackingIds: [
          "UA-70813941-5", // Google Analytics
          "AW-648334156", // Google adwords
        ]
      }
    },
    `gatsby-plugin-sitemap`,
    `gatsby-plugin-webpack-size`,
    `gatsby-plugin-robots-txt`,
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    // `gatsby-plugin-offline`,
  ],
}
