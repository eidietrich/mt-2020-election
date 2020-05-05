const fs = require('fs');
const { docToArchieML } = require('@newswire/doc-to-archieml');
const { google } = require('googleapis')

// const documentId = '1ycZZ3elJ80Ps1AQqQmbjmvJUMnCi41ABvRAxJA-_R3I'
const agAnswers = '1za8-9OqhHps8daDk6LOPvdfLT06YyaFFU5jrO95asMg' // AG spreadsheet
const agRange = 'Form Responses 1!A:L' // AG spreadsheet
// const outPath = './app/src/data/app-copy.json'
const outPath = 'scrapers/issue-questions/raw/out.json'

const editingDocId = '1gplgsSu4pVLedooxNi0VGBXwslXZ4EtXBqkZMgaD5mI'

const TOKEN_PATH = 'token-mtfp.json';

const selectCols = (row) => row.slice(6,) // For trimming internal use columns

const sheetsToParse = [
    {
        race: 'Governor',
        sheetId: '1dEnPn264z8fXk__Nat5vBT6N0fLXVa-MZpOP3l08Kl0',
        sheetRange: 'Form Responses 1!A:Q',
    },
    {
        race: 'U.S. Senate',
        sheetId: '1lyxF1Zy2TRlz5Fho8U4743vKgB-wNcgAphrzqQe19jo',
        sheetRange: 'Form Responses 1!A:P'
    },
    {
        race: 'U.S. House',
        sheetId: '1AhxCThbRTv_jdf2xUnp4U-bQ_aYPH2qq3QWwLsaJJfU',
        sheetRange: 'Form Responses 1!A:P',
    },
    {
        race: 'Attorney General',
        sheetId: '1za8-9OqhHps8daDk6LOPvdfLT06YyaFFU5jrO95asMg',
        sheetRange: 'Form Responses 1!A:L',
    },
    {
        race: 'PSC',
        sheetId: '1zJItNaaWf5RQgAn8odGkzSkmlpm4sJbIpO4oVyetYcY',
        sheetRange: 'Form Responses 1!A:L',
    }
]

/*
NOTE: Before running this, delete existing contents of doc
https://docs.google.com/document/d/1gplgsSu4pVLedooxNi0VGBXwslXZ4EtXBqkZMgaD5mI/edit
After running, add "[races]" to first line to fix Archie ML

^ These are workarounds for 1) Not knowing how to wipe the slate clean with the docs API and 2) Not having a perfect grasp of how to manage callbacks
*/

async function main() {
    // Load client secrets from a local file.
    console.log('Remember to clear the Google Doc first')
    console.log('After running, add "[races]" to top of doc')
    fs.readFile('credentials.json', (err, credentials) => {
        if (err) return console.log('Error loading client secret file:', err);
        authorize(JSON.parse(credentials), onAuthorization)
    });
}

function onAuthorization(auth){
    sheetsToParse.forEach(sheet => {
        parseSpreadsheet(auth, sheet, (data) => toArchieML(auth, data, sheet))
    })
}

function toArchieML(auth, data, config) {
    // console.log(data)
    const {headers, rows} = data
    const {race} = config
   
    const candidates = rows.map(row => {
        const includedCols = selectCols(row)
        const includeHeads = selectCols(headers)
        const responses = includedCols.map((col, i) => {
            return `
question: ${includeHeads[i]}
[.+answer]
${col}
[]`
        })
        return `
name: ${row[2]}
[.responses]
${responses}
[]`
    })
    const output = `
race: ${race}
[.candidates]
${candidates}
[]
`
    writeToDoc(auth, editingDocId, output)
}

async function writeToDoc(auth, id, multiLineText){
    // Ref https://github.com/googleapis/google-api-nodejs-client/blob/master/samples/docs/create.js
    const docs = google.docs({version: 'v1', auth});
    
    const updateResponse = await docs.documents.batchUpdate({
        documentId: id,
        requestBody: {
          requests: [
            {
            insertText: {
              // The first text inserted into the document must create a paragraph,
              // which can't be done with the `location` property.  Use the
              // `endOfSegmentLocation` instead, which assumes the Body if
              // unspecified.
              endOfSegmentLocation: {},
              text: multiLineText
            }
          }]
        }
      });
      console.log(updateResponse.data);
      return updateResponse.data;
}

async function parseSpreadsheet(auth, config, callback){
    const sheets = google.sheets({version: 'v4', auth});
    const {sheetId, sheetRange} = config
    sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: sheetRange,
      }, (err, res) => {
        if (err) return console.log('SS The API returned an error: ' + err);
        const values = res.data.values;
        // console.log('values', values)
        const headers = values[0]
        const rows =  dedupeRows(values.slice(1,))
        callback({headers, rows})
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

function dedupeRows(rows){
    // Takes last submission in case of duplicate entries from same email
    const sorted = rows.sort((a,b) => new Date(b[0]) - new Date(a[0]))
    const emails = Array.from(new Set(rows.map(d => d[1])))
    const deduped = emails.map(email => sorted.find(row => row[1] === email))
    return deduped
}

// async function fetchAML(auth) {
//     const results = await docToArchieML({documentId: documentId, auth})
//     results['lastUpdated'] = new Date()
//     const json = JSON.stringify(results, null, 2)
//     fs.writeFile(outPath, json, 'utf8', () => console.log(`Written to ${outPath}`));
// }

main().catch(console.error)