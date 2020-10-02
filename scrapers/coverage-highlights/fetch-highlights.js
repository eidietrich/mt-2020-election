const fs = require('fs');
const {google} = require('googleapis');

const TOKEN_PATH = 'token-mtfp.json';

const spreadsheetId = '14J2sDZ25bYjxzeB_6MtJvOW15VHhY03Uwh5cFXnZZSs'
const spreadsheetRange = 'links!A:E'

// const outPath = './app/src/data/outside-links.json'
const outPath = './data/highlight-links-raw.json'
// const outPath = './data/outside-links.json'

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Sheets API.
  authorize(JSON.parse(content), fetchData);
});

function fetchData(auth) {
  const sheets = google.sheets({version: 'v4', auth});
  sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId,
    range: spreadsheetRange,
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const rows = res.data.values;
    if (rows.length) {
    //   return rows
        reshapeData(rows)
        // console.log(rows.length, 'rows found')
        // console.log(rows)
    } else {
        console.log('No data found.');
    }
  });
}

function reshapeData(raw){
    // console.log(raw)
    const headers = raw[0]
    const rows = raw.slice(1,)
    // console.log(raw.length, headers, data.length)
    const data = rows.map(row => {
        const d = {}
        row.forEach((cell, i) => {
            const colKey = headers[i]
            d[colKey] = cell
        })
        return d
    })
    writeData(data)
}

function writeData(data){
    console.log('Highlight links found:', data.length)
    const output = JSON.stringify(data);
    fs.writeFile(outPath, output, 'utf8', () => console.log(`Written to ${outPath}`))
}

// Ref: https://developers.google.com/sheets/api/quickstart/nodejs?authuser=1
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    // if (err) return getNewToken(oAuth2Client, callback);
    if (err) console.log(`Missing token ${TOKEN_PATH} - re-run initialize-google-oath.js?`)
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

