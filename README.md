# Montana 2020

Work in progress news app for parsing & presenting candidate data for the 2020 Montana election cycle.

## Structure
- app - Gatsby app for building public-facing product
- analysis - Gatsby app designed for experiments/internal reporting work
- data - centralized repository for cleaned data, stored as .json (may migrate this to MongoDB down the road). NOTE: Currently messy
- scrapers - data acquistion/processing pipelines
- process - scripts for processing scraped data into forms used by app and analysis
- utils - one-off scripts

## Data flow

General pattern: Local scripts (Python or Node) to pull in data, stash as .json locally, then feed to Gatsby build process. Plan is to avoid mucking with a database if possible.

Some data pipeline folders contain Jupyter notebooks for exploration/script development.

See `package.json` for shorthand commands (TODO: Document these better)

### package.json commands

#### Public-facing app
- Develop app: `npm run start`
- Build app + serve local demo: `npm run local:demo`
- Build app + deploy demo to AWS demo server: `npm run deploy demo`
- Build app + deply to production (custom to MTFP server; expects PW): `npm run deploy:prod`

#### Data management
- Refresh app copy: `npm run refresh`
- Check state records for new candidates: ``
- Check state records for new finance filings: ``
- Fetch current state finance data: `` 
- Check federal records for new candidates: ``
- Check federal records for new finance filings: `TK`
- Fetch current federal finance data: ``


### Existing data processing pipelines
- *app-copy* - Pulls in [ArchieML](http://archieml.org) for app text content from [Google Doc](https://docs.google.com/document/d/1-PomtLY2bwwC9I-osdZnxcb8nwB9ubvhxyxLocPBk4w/edit). Relies on `token.json` and `credentials.json` in project root.
    - CMD: Refresh copy: `node scrapers/app-copy/fetch-app-copy.js`
- *coverage-outside* - Pulls in list of candidate/race media coverage from [Google Sheet](https://docs.google.com/spreadsheets/d/1Gc5T29Bq6sFrYHPjaK6RAkPTdLXzp5NTuX5AnIAOWpw/edit?usp=sharing)
    - CMD: Refresh links: `node scrapers/coverage-outside/fetch-coverage-links.js`
- *state-finance-reports* - itemized state/local race campaign finance data from COPP
    - CMD: Check for new candidate filings: `python3 scrapers/state-finance-reports/check-candidate-updates.py`
    - CMD: Check for new C-5 filings: `python3 scrapers/state-finance-reports/check-report-updates.py`
    - CMD: Refresh data: (Takes several minutes) `python3 scrapers/state-finance-reports/fetch-finance-reports.py`
    - CMD: Clean data: `python3 scrapers/state-finance-reports/clean.py`
    - CMD: Move to app: `sh utils/campaign-finance-to-app.sh` # replace w/ node script that also parses
- *fed-finance-reports* - race campaign finance data from FEC
    - TODO: Document this

### App data compilation

See `package.json`

### Deploy app to MTFP server

Built gatsby app in `app/public` can be deployed to S3 or similar

### Planned/potential (some of these won't be feasible)
- boundaries - house/senate district & (hopefully) precinct-level geodata
- boundaries-cartogram - build
- results-historical- historical election data from SOS
- results-primary - (as available in June 2020) - 2020 primary results
- results-general - (as available in Nov. 2020) - 2020 general results
- candidate-business-interests - data sourced to COPP D-1 filings (available early 2020)
- candidate-records - hand-curated info on prior accomplishments? (include in app-copy?)
- district-demographics - state district/precinct-level demographic data - census burea
- candidate-statements - hand-curate social media posts/press releases/other statements in Google Doc?
- candidate-mailers - mailers/advertisements - figure out system?
- spending-tv-spots - figure out how to scrape data from local TV stations

## TODO

- Build a shared component library? How would that work? [Storybook](https://storybook.js.org/)?
- Think through testing for data pipelines

## Ideas
- Get more info above the fold? - move intro to sidebar/below content on mobile
- Ballot initiatives. Where do the candidates stand?
- Candidate info - feed for each candidate (Q is how to curate)
- Dockerize build process
- Automate rebuild w github action + webhook/slack or chron job

Candidate info feed - components
- Display (live-blog style)
- G sheet backend
- Scraper tool --> Url to structured data
- Interface
    - Slack
    - Chrome extension?
    - Google Form?
    - Web app

Dockerize build process + rebuild w/ github action

## App Secrets
- npm cache clearing script expects the Cloudfront distribution ID in `$CLOUDFRONT_DIST`
