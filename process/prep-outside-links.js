const metascraper = require('metascraper')([
    require('metascraper-author')(),
    require('metascraper-date')(),
    require('metascraper-description')(),
    require('metascraper-image')(),
    // require('metascraper-logo')(),
    // require('metascraper-clearbit')(),
    // require('metascraper-publisher')(),
    require('metascraper-title')(),
    require('metascraper-url')()
  ])
const got = require('got')
// Ref https://github.com/microlinkhq/metascraper

const {
    getJson,
    writeJson,
    filterToActive,
    makeRaceKey,
    makeCandidateKey,
} = require('./functions.js')

const OUTSIDE_LINKS_PATH_IN = './data/outside-links-raw.json'
const OUTSIDE_LINKS_PATH_OUT_1 = './data/outside-links-metadated.json' 
const OUTSIDE_LINKS_PATH_OUT_2 = './app/src/data/outside-links.json' 

const APP_COPY_PATH = './app/src/data/app-copy.json' // TODO: Standardize this

const rawStories = getJson(OUTSIDE_LINKS_PATH_IN)
const { candidates, races } = getJson(APP_COPY_PATH)

main()

async function main(){
    checkForBadMatches(rawStories)

    const metadataEnhancedStories = rawStories.map(async story => {
        try {
            const metadata = await fetchMetadata(story.link)
            return {
                ...story,
                title: metadata.title,
                date: metadata.date,
                author: metadata.author,
                imageUrl: metadata.image,
                description: metadata.description
            }
        }
        catch (err) {
            console.log(
                err.name,
                err.url,
                // Object.keys(err)
                )
        }
    })

    Promise.all(metadataEnhancedStories)
        .then(stories => {
            console.log(`Fetched metadata for ${stories.length} stories.`)
            writeJson(OUTSIDE_LINKS_PATH_OUT_1, stories)
            writeJson(OUTSIDE_LINKS_PATH_OUT_2, stories)
        })
}



async function fetchMetadata(targetUrl){
    const { body: html, url } = await got(targetUrl)
    const metadata = await metascraper({ html, url })
    return metadata
}

function checkForBadMatches(stories){
    // check for candidate keys in google sheet that don't match app copy
    const linkDocCandidateKeys = Array.from(new Set(stories.map(d => d.candidate)))
    const appCopyCandidateKeys = Array.from(new Set(candidates.map(c => makeCandidateKey(c))))
    const candidateKeysNotInAppCopy = linkDocCandidateKeys.filter(key => !appCopyCandidateKeys.includes(key))
    if (candidateKeysNotInAppCopy.length) console.log(`Bad candidate key(s): ${candidateKeysNotInAppCopy}`)

    // check for race keys in google sheet that don't match app copy
    const linkDocRaceKeys = Array.from(new Set(stories.map(d => d.race)))
    const appCopyRaceKeys = Array.from(new Set(races.map(r => makeRaceKey(r))))
    const raceKeysNotInAppCopy = linkDocRaceKeys.filter(key => !appCopyRaceKeys.includes(key))
    if (raceKeysNotInAppCopy.length) console.log(`Bad race key(s): ${raceKeysNotInAppCopy}`)

    // tabulate # of links per candidate
    console.log('\n## Outside coverage link counts by candidate:')
    filterToActive(candidates).forEach(candidate => {
        const candidateKey = makeCandidateKey(candidate)
        const candidateLinks = stories.filter(d => d.candidate === candidateKey)
        const featured = candidateLinks.filter(d => d.candidate_page_featured === 'yes')
        const nonfeatured = candidateLinks.filter(d => d.candidate_page_featured !== 'yes')
        console.log(`${featured.length} ${nonfeatured.length} | ${candidateKey}`)
    })

    // tabluate # of links per race
    console.log('\n## Outside coverage link counts by race:')
    races.forEach(race => {
        const raceKey = makeRaceKey(race)
        const raceLinks = stories.filter(d => d.race === raceKey)
        const featured = raceLinks.filter(d => d.race_page_featured === 'yes')
        const nonfeatured = raceLinks.filter(d => d.race_page_featured !== 'yes')
        console.log(`${featured.length} ${nonfeatured.length} | ${raceKey}`)
    })


}
