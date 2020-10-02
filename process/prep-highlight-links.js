const {
    getJson,
    writeJson,
    makeRaceKey,
} = require('./functions.js')

const HIGHLIGHT_LINKS_PATH_IN = './data/highlight-links-raw.json'
// const OUTSIDE_LINKS_PATH_OUT_1 = './data/outside-links-metadated.json' 
const OUTSIDE_LINKS_PATH_OUT = './app/src/data/highlight-links.json' 

const APP_COPY_PATH = './app/src/data/app-copy.json' // TODO: Standardize this

const stories = getJson(HIGHLIGHT_LINKS_PATH_IN)
const { races } = getJson(APP_COPY_PATH)

main()

async function main(){
    checkForBadMatches(stories)
    writeJson(OUTSIDE_LINKS_PATH_OUT, stories)
}

function checkForBadMatches(stories){
    // check for race keys in google sheet that don't match app copy
    const linkDocRaceKeys = Array.from(new Set(stories.map(d => d.race)))
    const appCopyRaceKeys = Array.from(new Set(races.map(r => makeRaceKey(r))))
    const raceKeysNotInAppCopy = linkDocRaceKeys.filter(key => !appCopyRaceKeys.includes(key))
    if (raceKeysNotInAppCopy.length) console.log(`Bad race key(s): ${raceKeysNotInAppCopy}`)

    // tabluate # of links per race
    console.log('\n## Highlight coverage link counts by race')
    races.forEach(race => {
        const raceKey = makeRaceKey(race)
        const raceLinks = stories.filter(d => d.race === raceKey)
        console.log(`${raceLinks.length} | ${raceKey}`)
    })


}
