/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

// You can delete this file if you're not using it

const { candidates } = require('./src/data/app-copy.json')

// redundant w/ src/logic/functions.js bc node doesn't like modern import calls
const makeCandidateKey = candidate => (candidate.first_name + '-' + candidate.last_name).replace(/\s/g, '-')


exports.createPages = async({ actions: { createPage } }) => {
    // bills pages
    candidates.forEach(candidate => {
        createPage({
            path: `/candidates/${makeCandidateKey(candidate)}`,
            component: require.resolve('./src/templates/candidate.js'),
            context: { candidate },
        })
    })

}