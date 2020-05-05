const fs = require('fs');
const { docToArchieML } = require('@newswire/doc-to-archieml');
const { google } = require('googleapis')

const editingDocId = '1gplgsSu4pVLedooxNi0VGBXwslXZ4EtXBqkZMgaD5mI'
// const outPath = 'scrapers/issue-questions/edited-answers.json'
const outPath = 'app/src/data/q-and-a.json'

const TOKEN_PATH = 'token-mtfp.json';

async function main() {
    // Load client secrets from a local file.
    fs.readFile('credentials.json', (err, credentials) => {
        if (err) return console.log('Error loading client secret file:', err);
        authorize(JSON.parse(credentials), fetchAML)
    });
}

function authorize(credentials, callback) {
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);
  
    // Go to utils/initialize-google-oauth.js if token is mising
    fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) console.log(`Missing token ${TOKEN_PATH} - re-run initialize-google-oath.js?`)
      oAuth2Client.setCredentials(JSON.parse(token));
      callback(oAuth2Client);
    });
}

async function fetchAML(auth) {
    const results = await docToArchieML({documentId: editingDocId, auth})
    results['lastUpdated'] = new Date()
    const cleaned = clean(results)
    const json = JSON.stringify(cleaned, null, 2)
    fs.writeFile(outPath, json, 'utf8', () => console.log(`Written to ${outPath}`));
}

function clean(raw){
    const cleaned = raw.races.map(race => {
        return race.candidates.map(candidate => ({
            race: race.race,
            name: candidate.name,
            responses: candidate.responses   
        }))
    }).flat()
    return cleaned
}

main().catch(console.error)